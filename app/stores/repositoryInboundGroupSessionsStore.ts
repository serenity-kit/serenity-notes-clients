import AsyncStorage from "@react-native-async-storage/async-storage";

export const getRepositoryInboundGroupSesssions = async (
  repositoryId: string
): Promise<any> => {
  const inboundGroupSesssionsString = await AsyncStorage.getItem(
    `repositoryInboundGroupSesssions${repositoryId}`
  );
  if (!inboundGroupSesssionsString) return {};
  return JSON.parse(inboundGroupSesssionsString);
};

export const setRepositoryInboundGroupSesssions = async (
  repositoryId: string,
  inboundGroupSessions: any
) => {
  const existingInboundGroupSesssions = await getRepositoryInboundGroupSesssions(
    repositoryId
  );
  const combinedInboundGroupSesssions = {
    ...existingInboundGroupSesssions,
    ...inboundGroupSessions,
  };
  return await AsyncStorage.setItem(
    `repositoryInboundGroupSesssions${repositoryId}`,
    JSON.stringify(combinedInboundGroupSesssions)
  );
};
