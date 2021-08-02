import cryptoJsAes from "crypto-js/aes";
import cryptoJsTypedArrays from "crypto-js/lib-typedarrays";
import cryptoJsUtf8 from "crypto-js/enc-utf8";
import cryptoJsHex from "crypto-js/enc-hex";
import Olm from "../utils/olm_legacy";
import SecureStore from "../utils/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import storePrefix from "../utils/storePrefix/storePrefix";
import { addDebugLogEntry } from "./debugStore";

export const pickleKey = "SERENITY";

let currentDevice: null | Olm.Account = null;
let currentDeviceEncryptionKey: null | string = null;
let currentDeviceEncryptionIv: null | string = null;

type DeviceSubscriptionCallback = (device: null | any) => void;

type DeviceSubscriptionEntry = {
  id: string;
  callback: DeviceSubscriptionCallback;
};

const deviceEncryptionKeyAndIvKey = `${storePrefix}device-encryption-key-and-iv`;
const encryptedDeviceStoreKey = `${storePrefix}encrypted-device`;
const legacyDeviceStoreKey = `${storePrefix}device`;
let deviceStoreSubscriptions: DeviceSubscriptionEntry[] = [];
let deviceStoreIdCounter = 0;

const getDeviceEncryptionKeyAndIv = async (): Promise<{
  iv: string;
  key: string;
}> => {
  // cache the key & iv to avoid constantly getting persistant values from the store
  if (currentDeviceEncryptionKey && currentDeviceEncryptionIv) {
    return {
      key: currentDeviceEncryptionKey,
      iv: currentDeviceEncryptionIv,
    };
  }
  const result = JSON.parse(
    await SecureStore.getItemAsync(deviceEncryptionKeyAndIvKey)
  );
  if (result === null) return null;
  currentDeviceEncryptionKey = cryptoJsHex.parse(result.key);
  currentDeviceEncryptionIv = cryptoJsHex.parse(result.iv);
  return {
    key: currentDeviceEncryptionKey,
    iv: currentDeviceEncryptionIv,
  };
};

const restoreDevice = (pickledDevice) => {
  const currentDevice = new Olm.Account();
  currentDevice.unpickle(pickleKey, pickledDevice);
  return currentDevice;
};

export const initDeviceStore = async () => {
  const deviceEncryptionKeyAndIv = await getDeviceEncryptionKeyAndIv();
  if (deviceEncryptionKeyAndIv !== null) {
    const encryptedStoreResult = await AsyncStorage.getItem(
      encryptedDeviceStoreKey
    );
    if (encryptedStoreResult !== null) {
      const { key, iv } = deviceEncryptionKeyAndIv;
      const result = cryptoJsAes.decrypt(encryptedStoreResult, key, { iv });
      currentDevice = restoreDevice(result.toString(cryptoJsUtf8));
      return;
    }
  }

  // restore unencrypted device info used in version <1.8.2 and
  // migrate to encrypted version
  const storeResult = await AsyncStorage.getItem(legacyDeviceStoreKey);
  if (storeResult !== null) {
    currentDevice = restoreDevice(JSON.parse(storeResult));
    try {
      await persistNewDevice(currentDevice);
      await AsyncStorage.removeItem(legacyDeviceStoreKey);
      return;
    } catch (err) {
      addDebugLogEntry(
        `Failed to remove the legacy device store entry: ${err}`,
        "error"
      );
    }
  }

  currentDevice = null;
};

export const persistDevice = async () => {
  const deviceEncryptionKeyAndIv = await getDeviceEncryptionKeyAndIv();
  const { key, iv } = deviceEncryptionKeyAndIv;
  const encryptedDevice = cryptoJsAes
    .encrypt(currentDevice.pickle(pickleKey), key, { iv })
    .toString();
  const result = await AsyncStorage.setItem(
    encryptedDeviceStoreKey,
    encryptedDevice
  );
  deviceStoreSubscriptions.forEach((entry) => {
    entry.callback(currentDevice);
  });
  return result;
};

export const persistNewDevice = async (device) => {
  const iv = cryptoJsTypedArrays.random(16).toString(); // 128 / 8
  const key = cryptoJsTypedArrays.random(32).toString(); // 256 / 8
  await SecureStore.setItemAsync(
    deviceEncryptionKeyAndIvKey,
    JSON.stringify({ key, iv })
  );

  currentDevice = device;
  return await persistDevice();
};

export const hasDevice = () => {
  return currentDevice !== null;
};

export const getDevice = () => {
  return currentDevice;
};

export const subscribeToDevice = (callback: DeviceSubscriptionCallback) => {
  deviceStoreIdCounter++;
  const id = deviceStoreIdCounter.toString();
  deviceStoreSubscriptions.push({ id, callback });
  return id;
};

export const unsubscribeToDevice = (subscriptionId) => {
  deviceStoreSubscriptions = deviceStoreSubscriptions.filter(
    (entry) => entry.id !== subscriptionId
  );
};

export const deleteDevice = async () => {
  currentDeviceEncryptionKey = null;
  currentDeviceEncryptionIv = null;
  try {
    await AsyncStorage.removeItem(legacyDeviceStoreKey);
  } catch (err) {
    addDebugLogEntry(
      `Failed to remove the legacy device store entry: ${err}`,
      "error"
    );
  }
  try {
    await AsyncStorage.removeItem(encryptedDeviceStoreKey);
    await SecureStore.deleteItemAsync(deviceEncryptionKeyAndIvKey);
  } catch (err) {
    addDebugLogEntry(
      `Failed to remove the device store entry: ${err}`,
      "error"
    );
  }
  currentDevice = null;
  deviceStoreSubscriptions.forEach((entry) => {
    entry.callback(null);
  });
};
