import AsyncStorage from "@react-native-async-storage/async-storage";
import storePrefix from "../utils/storePrefix/storePrefix";

const privateInfoRecentInboundGroupSessionIdKey = `${storePrefix}privateInfoRecentInboundGroupSessionId`;

export const getPrivateInfoInboundGroupSessionId = async (
  sourceDeviceKey: string
): Promise<string | null> => {
  return await AsyncStorage.getItem(
    `${privateInfoRecentInboundGroupSessionIdKey}${sourceDeviceKey}`
  );
};

export const setPrivateInfoInboundGroupSessionId = async (
  sourceDeviceKey: string,
  groupSessionId: string
) => {
  return await AsyncStorage.setItem(
    `${privateInfoRecentInboundGroupSessionIdKey}${sourceDeviceKey}`,
    groupSessionId
  );
};
