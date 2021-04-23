import * as SecureStore from "expo-secure-store";

type PrivateUserSigningKeySubscriptionCallback = (
  privateUserSigningKey?: string
) => void;

type PrivateUserSigningKeySubscriptionEntry = {
  id: string;
  callback: PrivateUserSigningKeySubscriptionCallback;
};

const secureStoreKey = "privateUserSigningKey";
let privateUserSigningKeyStoreSubscriptions: PrivateUserSigningKeySubscriptionEntry[] = [];
let privateUserSigningKeyStoreIdCounter = 0;

export const setPrivateUserSigningKey = async (
  privateUserSigningKey: string
) => {
  const result = await SecureStore.setItemAsync(
    secureStoreKey,
    privateUserSigningKey
  );
  privateUserSigningKeyStoreSubscriptions.forEach((entry) => {
    entry.callback(privateUserSigningKey);
  });
  return result;
};

export const getPrivateUserSigningKey = async (): Promise<string> => {
  return await SecureStore.getItemAsync(secureStoreKey);
};

export const subscribeToPrivateUserSigningKey = (
  callback: PrivateUserSigningKeySubscriptionCallback
) => {
  privateUserSigningKeyStoreIdCounter++;
  const id = privateUserSigningKeyStoreIdCounter.toString();
  privateUserSigningKeyStoreSubscriptions.push({ id, callback });
  return id;
};

export const unsubscribeToPrivateUserSigningKey = (subscriptionId) => {
  privateUserSigningKeyStoreSubscriptions = privateUserSigningKeyStoreSubscriptions.filter(
    (entry) => entry.id !== subscriptionId
  );
};

export const deletePrivateUserSigningKey = async () => {
  await SecureStore.deleteItemAsync(secureStoreKey);
  privateUserSigningKeyStoreSubscriptions.forEach((entry) => {
    entry.callback();
  });
};
