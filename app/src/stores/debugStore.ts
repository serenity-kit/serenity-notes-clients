import AsyncStorage from "@react-native-async-storage/async-storage";
import { DebugEntryType, DebugEntry } from "../types";

let debugLogActive = false;

export const initDebugStore = async () => {
  const storeResult = await AsyncStorage.getItem("debugLogActive");
  debugLogActive =
    storeResult !== null && storeResult === "true"
      ? Boolean(storeResult)
      : false;
};

export const getDebugLogActive = () => {
  return debugLogActive;
};

export const setDebugLogActive = async (value: boolean) => {
  debugLogActive = value;
  return await AsyncStorage.setItem("debugLogActive", value ? "true" : "false");
};

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
  if (debugLog.length > 2500) {
    debugLog.pop();
  }
  await AsyncStorage.setItem("debugLog", JSON.stringify(debugLog));
};
