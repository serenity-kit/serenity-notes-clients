import { Alert } from "react-native";
import * as repositoryStore from "../../stores/repositoryStore";
import * as deviceStore from "../../utils/deviceStore";
import {
  createGroupSession,
  createGroupSessionMessage,
  createAuthenticationToken,
  createRepositoryUpdate,
  serializeGroupSession,
} from "../../utils/device";
import claimOneTimeKeys from "../../utils/server/claimOneTimeKeys";
import { uInt8ArrayToBase64 } from "../../utils/base64";
import createRepositoryMutation from "../../graphql/createRepositoryMutation";
import fetchMyVerifiedDevices from "../../utils/server/fetchMyVerifiedDevices";
import client from "../../utils/urqlClient";
import schemaVersion from "../../utils/schemaVersion/schemaVersion";

const createRepository = async (repositoryId: string) => {
  const currentDevice = deviceStore.getDevice();
  if (!currentDevice) {
    Alert.alert("Device not initialized.");
    return;
  }
  const verifiedDevices = await fetchMyVerifiedDevices(client);
  const groupSession = createGroupSession();
  // NOTE due fallbackKeys there always will be one key for each device
  const oneTimeKeysWithDeviceIdKey = await claimOneTimeKeys(
    client,
    currentDevice,
    verifiedDevices
  );
  const groupSessionMessages = oneTimeKeysWithDeviceIdKey.map(
    (oneTimeKeyWithDeviceIdKey) => {
      return createGroupSessionMessage(
        groupSession.prevKeyMessage,
        currentDevice,
        oneTimeKeyWithDeviceIdKey.deviceIdKey,
        oneTimeKeyWithDeviceIdKey.oneTimeKey.key
      );
    }
  );

  const repo = await repositoryStore.getRepository(repositoryId);
  const encryptedContent = createRepositoryUpdate(
    groupSession,
    currentDevice,
    uInt8ArrayToBase64(repo.content),
    repo.updatedAt
  );

  const createRepositoryResult = await client
    .mutation(
      createRepositoryMutation,
      {
        input: {
          content: {
            encryptedContent,
            groupSessionMessages,
            schemaVersion,
            schemaVersionSignature: currentDevice.sign(
              schemaVersion.toString()
            ),
          },
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              currentDevice
            )}`,
          },
        },
      }
    )
    .toPromise();

  if (createRepositoryResult?.data?.createRepository?.repository?.id) {
    const repo2 = await repositoryStore.getRepository(repositoryId);
    await repositoryStore.setRepository({
      ...repo2,
      serverId: createRepositoryResult.data.createRepository.repository.id,
      groupSessionMessageIds:
        createRepositoryResult.data.createRepository.groupSessionMessageIds,
      groupSession: serializeGroupSession(groupSession),
      groupSessionCreatedAt: new Date().toISOString(),
    });
  } else {
    throw new Error("createRepository mutation failed");
  }
};

export default createRepository;
