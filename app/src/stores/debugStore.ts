import AsyncStorage from "@react-native-async-storage/async-storage";
import { DebugEntryType, DebugEntry } from "../types";

export const getDebugLog = async (): Promise<DebugEntry[]> => {
  const debugInfoString = await AsyncStorage.getItem("debugLog");
  if (!debugInfoString) return [];
  return JSON.parse(debugInfoString);
};

export const setDebugLog = async (
  content: string,
  type: DebugEntryType = "info"
) => {
  // TODO have a queue that collects writes and writes them whenever possibles
  const debugLog = await getDebugLog();
  debugLog.push({
    content,
    createdAt: new Date().toISOString(),
    type,
  });
  // TODO remove if more thant 1k entries exist
  await AsyncStorage.setItem("debugLog", JSON.stringify(debugLog));
};
