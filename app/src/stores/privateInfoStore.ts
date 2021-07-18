import AsyncStorage from "@react-native-async-storage/async-storage";
import { uInt8ArrayToBase64, base64ToUInt8Array } from "../utils/encoding";
import { Y } from "../vendor/index.js";
import storePrefix from "../utils/storePrefix/storePrefix";

type PrivateInfoSubscriptionCallback = (privateInfo?: any) => void;

type PrivateInfoSubscriptionEntry = {
  id: string;
  callback: PrivateInfoSubscriptionCallback;
};

const privateInfoKey = `${storePrefix}privateInfo`;
let privateInfoStoreSubscriptions: PrivateInfoSubscriptionEntry[] = [];
let privateInfoStoreIdCounter = 0;

export const setPrivateInfo = async (privateInfo) => {
  const serializedPrivateInfo = uInt8ArrayToBase64(
    Y.encodeStateAsUpdate(privateInfo)
  );
  const result = await AsyncStorage.setItem(
    privateInfoKey,
    serializedPrivateInfo
  );
  privateInfoStoreSubscriptions.forEach((entry) => {
    entry.callback(privateInfo);
  });
  return result;
};

export const getPrivateInfo = async () => {
  const storeItem = await AsyncStorage.getItem(privateInfoKey);
  if (storeItem) {
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, base64ToUInt8Array(storeItem));
    return yDoc;
  }
  return new Y.Doc();
};

export const subscribeToPrivateInfo = (
  callback: PrivateInfoSubscriptionCallback
) => {
  privateInfoStoreIdCounter++;
  const id = privateInfoStoreIdCounter.toString();
  privateInfoStoreSubscriptions.push({ id, callback });
  return id;
};

export const unsubscribeToPrivateInfo = (subscriptionId) => {
  privateInfoStoreSubscriptions = privateInfoStoreSubscriptions.filter(
    (entry) => entry.id !== subscriptionId
  );
};

export const deletePrivateInfo = async () => {
  await AsyncStorage.removeItem(privateInfoKey);
  const cleanYDoc = new Y.Doc();
  privateInfoStoreSubscriptions.forEach((entry) => {
    entry.callback(cleanYDoc);
  });
};
