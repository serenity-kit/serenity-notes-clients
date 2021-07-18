import AsyncStorage from "@react-native-async-storage/async-storage";
import storePrefix from "../utils/storePrefix/storePrefix";

const repositoryInboundGroupSesssionsKey = `${storePrefix}repositoryInboundGroupSesssions`;

export const getRepositoryInboundGroupSesssions = async (
  repositoryId: string
): Promise<any> => {
  const inboundGroupSesssionsString = await AsyncStorage.getItem(
    `${repositoryInboundGroupSesssionsKey}${repositoryId}`
  );
  if (!inboundGroupSesssionsString) return {};
  return JSON.parse(inboundGroupSesssionsString);
};

export const setRepositoryInboundGroupSesssions = async (
  repositoryId: string,
  inboundGroupSessions: any
) => {
  const existingInboundGroupSesssions =
    await getRepositoryInboundGroupSesssions(repositoryId);
  const combinedInboundGroupSesssions = {
    ...existingInboundGroupSesssions,
    ...inboundGroupSessions,
  };
  return await AsyncStorage.setItem(
    `${repositoryInboundGroupSesssionsKey}${repositoryId}`,
    JSON.stringify(combinedInboundGroupSesssions)
  );
};
