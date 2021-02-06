import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPrivateInfoInboundGroupSessionId = async (
  sourceDeviceKey: string
): Promise<string | null> => {
  return await AsyncStorage.getItem(
    `privateInfoRecentInboundGroupSessionId${sourceDeviceKey}`
  );
};

export const setPrivateInfoInboundGroupSessionId = async (
  sourceDeviceKey: string,
  groupSessionId: string
) => {
  return await AsyncStorage.setItem(
    `privateInfoRecentInboundGroupSessionId${sourceDeviceKey}`,
    groupSessionId
  );
};
