import { User } from "../types";
import * as SecureStore from "expo-secure-store";

type UserSubscriptionCallback = (user?: User) => void;

type UserSubscriptionEntry = {
  id: string;
  callback: UserSubscriptionCallback;
};

const secureStoreKey = "user";
let userStoreSubscriptions: UserSubscriptionEntry[] = [];
let userStoreIdCounter = 0;

export const setUser = async (user: User) => {
  const result = await SecureStore.setItemAsync(
    secureStoreKey,
    JSON.stringify(user)
  );
  userStoreSubscriptions.forEach((entry) => {
    entry.callback(user);
  });
  return result;
};

export const getUser = async (): Promise<User> => {
  return JSON.parse(await SecureStore.getItemAsync(secureStoreKey));
};

export const subscribeToUser = (callback: UserSubscriptionCallback) => {
  userStoreIdCounter++;
  const id = userStoreIdCounter.toString();
  userStoreSubscriptions.push({ id, callback });
  return id;
};

export const unsubscribeToUser = (subscriptionId) => {
  userStoreSubscriptions = userStoreSubscriptions.filter(
    (entry) => entry.id !== subscriptionId
  );
};

export const deleteUser = async () => {
  await SecureStore.deleteItemAsync(secureStoreKey);
  userStoreSubscriptions.forEach((entry) => {
    entry.callback();
  });
};
