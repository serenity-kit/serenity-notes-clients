import AsyncStorage from "@react-native-async-storage/async-storage";
import storePrefix from "../utils/storePrefix/storePrefix";

const oneTimeKeysFailedToRemoveFromServerKey = `${storePrefix}oneTimeKeysFailedToRemoveFromServer`;

let oneTimeKeys = [];

export const initOneTimeKeysFailedToRemoveFromServer = async () => {
  const result = await AsyncStorage.getItem(
    oneTimeKeysFailedToRemoveFromServerKey
  );
  if (!result) return;
  oneTimeKeys = JSON.parse(result);
};

export const addOneTimeKey = async (oneTimeKey: string) => {
  oneTimeKeys.push(oneTimeKey);
  await AsyncStorage.setItem(
    oneTimeKeysFailedToRemoveFromServerKey,
    JSON.stringify(oneTimeKeys)
  );
};

export const getOneTimeKeys = () => {
  return oneTimeKeys;
};
