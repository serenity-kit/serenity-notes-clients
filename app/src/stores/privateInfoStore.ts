import AsyncStorage from "@react-native-async-storage/async-storage";
import { uInt8ArrayToBase64, base64ToUInt8Array } from "../utils/encoding";
import { Y } from "../vendor/index.js";

type PrivateInfoSubscriptionCallback = (privateInfo?: any) => void;

type PrivateInfoSubscriptionEntry = {
  id: string;
  callback: PrivateInfoSubscriptionCallback;
};

const storeKey = "privateInfo";
let privateInfoStoreSubscriptions: PrivateInfoSubscriptionEntry[] = [];
let privateInfoStoreIdCounter = 0;

export const setPrivateInfo = async (privateInfo) => {
  const serializedPrivateInfo = uInt8ArrayToBase64(
    Y.encodeStateAsUpdate(privateInfo)
  );
  const result = await AsyncStorage.setItem(
    "privateInfo",
    serializedPrivateInfo
  );
  privateInfoStoreSubscriptions.forEach((entry) => {
    entry.callback(privateInfo);
  });
  return result;
};

export const getPrivateInfo = async () => {
  const storeItem = await AsyncStorage.getItem(storeKey);
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
  await AsyncStorage.removeItem(storeKey);
  const cleanYDoc = new Y.Doc();
  privateInfoStoreSubscriptions.forEach((entry) => {
    entry.callback(cleanYDoc);
  });
};
