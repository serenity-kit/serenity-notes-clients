import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mutation } from "../hooks/useSyncUtils/mutationQueue";
import storePrefix from "../utils/storePrefix/storePrefix";

const mutationQueueKey = `${storePrefix}mutationQueue`;

export const getMutationQueue = async (): Promise<Mutation[]> => {
  const mutationQueueString = await AsyncStorage.getItem(mutationQueueKey);
  if (!mutationQueueString) return [];
  return JSON.parse(mutationQueueString);
};

export const setMutationQueue = async (mutations: Mutation[]) => {
  await AsyncStorage.setItem(mutationQueueKey, JSON.stringify(mutations));
};
