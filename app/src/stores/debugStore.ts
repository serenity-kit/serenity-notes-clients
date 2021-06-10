import AsyncStorage from "@react-native-async-storage/async-storage";
import { DebugEntryType, DebugEntry } from "../types";
import { debounce } from "../utils/debounce";

let debugLogActive = false;
let debugLog: DebugEntry[] = [];

export const initDebugStore = async () => {
  const serializedDebugLogActive = await AsyncStorage.getItem("debugLogActive");
  debugLogActive =
    serializedDebugLogActive !== null && serializedDebugLogActive === "true"
      ? Boolean(serializedDebugLogActive)
      : false;

  const serializedDebugLog = await AsyncStorage.getItem("debugLog");
  debugLog = !serializedDebugLog ? [] : JSON.parse(serializedDebugLog);
};

export const getDebugLogActive = () => {
  return debugLogActive;
};

export const setDebugLogActive = async (value: boolean) => {
  debugLogActive = value;
  return await AsyncStorage.setItem("debugLogActive", value ? "true" : "false");
};

export const getDebugLog = () => {
  return debugLog;
};

const debouncedPersistDebugLog = debounce(() => {
  AsyncStorage.setItem("debugLog", JSON.stringify(debugLog));
}, 2000);

export const addDebugLogEntry = (
  content: string,
  type: DebugEntryType = "info"
) => {
  if (!debugLogActive) {
    return;
  }
  debugLog.push({
    content,
    createdAt: new Date().toISOString(),
    type,
  });
  if (debugLog.length > 2500) {
    debugLog.pop();
  }
  debouncedPersistDebugLog();
};
