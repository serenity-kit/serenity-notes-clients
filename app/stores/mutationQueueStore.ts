import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mutation } from "../hooks/useSyncUtils/mutationQueue";

export const getMutationQueue = async (): Promise<Mutation[]> => {
  const mutationQueueString = await AsyncStorage.getItem("mutationQueue");
  if (!mutationQueueString) return [];
  return JSON.parse(mutationQueueString);
};

export const setMutationQueue = async (mutations: Mutation[]) => {
  await AsyncStorage.setItem("mutationQueue", JSON.stringify(mutations));
};
