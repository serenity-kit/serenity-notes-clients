import { User } from "../types";
import SecureStore from "../utils/secureStore";
import storePrefix from "../utils/storePrefix/storePrefix";

type UserSubscriptionCallback = (user?: User) => void;

type UserSubscriptionEntry = {
  id: string;
  callback: UserSubscriptionCallback;
};

const userKey = `${storePrefix}user`;
let userStoreSubscriptions: UserSubscriptionEntry[] = [];
let userStoreIdCounter = 0;

export const setUser = async (user: User) => {
  const result = await SecureStore.setItemAsync(userKey, JSON.stringify(user));
  userStoreSubscriptions.forEach((entry) => {
    entry.callback(user);
  });
  return result;
};

export const getUser = async (): Promise<User> => {
  return JSON.parse(await SecureStore.getItemAsync(userKey));
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
  await SecureStore.deleteItemAsync(userKey);
  userStoreSubscriptions.forEach((entry) => {
    entry.callback();
  });
};
