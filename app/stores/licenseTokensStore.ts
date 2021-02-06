import AsyncStorage from "@react-native-async-storage/async-storage";
import { LicenseToken } from "../types";

type LicenseTokenSubscriptionCallback = (licenseTokens: LicenseToken[]) => void;

type LicenseTokenSubscriptionEntry = {
  id: string;
  callback: LicenseTokenSubscriptionCallback;
};

let licenseTokensStoreSubscriptions: LicenseTokenSubscriptionEntry[] = [];
let licenseTokensStoreIdCounter = 0;

export const getLicenseTokens = async (): Promise<LicenseToken[]> => {
  const licenseTokensString = await AsyncStorage.getItem("licenseTokens");
  if (!licenseTokensString) return [];
  return JSON.parse(licenseTokensString);
};

export const setLicenseTokens = async (licenseTokens: LicenseToken[]) => {
  await AsyncStorage.setItem("licenseTokens", JSON.stringify(licenseTokens));
  licenseTokensStoreSubscriptions.forEach((entry) => {
    entry.callback(licenseTokens);
  });
};

export const subscribeToLicenseTokens = (
  callback: LicenseTokenSubscriptionCallback
) => {
  licenseTokensStoreIdCounter++;
  const id = licenseTokensStoreIdCounter.toString();
  licenseTokensStoreSubscriptions.push({ id, callback });
  return id;
};

export const unsubscribeToLicenseTokens = (subscriptionId) => {
  licenseTokensStoreSubscriptions = licenseTokensStoreSubscriptions.filter(
    (entry) => entry.id !== subscriptionId
  );
};
