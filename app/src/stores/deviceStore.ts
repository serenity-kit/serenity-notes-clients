import Olm from "../utils/olm_legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const pickleKey = "SERENITY";

let currentDevice: null | Olm.Account = null;

type DeviceSubscriptionCallback = (device: null | any) => void;

type DeviceSubscriptionEntry = {
  id: string;
  callback: DeviceSubscriptionCallback;
};

const secureStoreKey = "device";
let deviceStoreSubscriptions: DeviceSubscriptionEntry[] = [];
let deviceStoreIdCounter = 0;

const restoreDevice = (pickledDevice) => {
  const currentDevice = new Olm.Account();
  currentDevice.unpickle(pickleKey, pickledDevice);
  return currentDevice;
};

export const initDeviceStore = async () => {
  const storeResult = await AsyncStorage.getItem(secureStoreKey);
  currentDevice =
    storeResult !== null ? restoreDevice(JSON.parse(storeResult)) : null;
};

export const persistDevice = async () => {
  const result = await AsyncStorage.setItem(
    "device",
    JSON.stringify(currentDevice.pickle(pickleKey))
  );
  deviceStoreSubscriptions.forEach((entry) => {
    entry.callback(currentDevice);
  });
  return result;
};

export const persistNewDevice = async (device) => {
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
  await AsyncStorage.removeItem(secureStoreKey);
  currentDevice = null;
  deviceStoreSubscriptions.forEach((entry) => {
    entry.callback(null);
  });
};
