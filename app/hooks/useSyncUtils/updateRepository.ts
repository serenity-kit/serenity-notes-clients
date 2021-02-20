import { Alert } from "react-native";
import * as repositoryStore from "../../utils/repositoryStore";
import * as deviceStore from "../../utils/deviceStore";
import {
  createGroupSession,
  createGroupSessionMessage,
  createAuthenticationToken,
  createRepositoryUpdate,
  serializeGroupSession,
  restoreGroupSession,
} from "../../utils/device";
import claimOneTimeKeys from "../../utils/server/claimOneTimeKeys";
import { uInt8ArrayToBase64 } from "../../utils/base64";
import verifiedDevicesForRepository from "./verifiedDevicesForRepository";
import updateRepositoryContentMutation from "../../graphql/updateRepositoryContentMutation";
import updateRepositoryContentAndGroupSessionMutation from "../../graphql/updateRepositoryContentAndGroupSessionMutation";
import client from "../../utils/urqlClient";

const updateRepository = async (
  repositoryId: string,
  forceNewGroupSession: boolean
) => {
  const currentDevice = deviceStore.getDevice();
  if (!currentDevice) {
    Alert.alert("Device not initialized.");
    return;
  }

  const repo = await repositoryStore.getRepository(repositoryId);
  const {
    verifiedDevices,
    newGroupSessionNeeded,
  } = await verifiedDevicesForRepository(
    client,
    repo.serverId,
    repo.groupSessionMessageIds || [],
    currentDevice
  );

  let isOutdatedGroupSession = true;
  if (repo.groupSessionCreatedAt) {
    const diffTime = Math.abs(
      // @ts-ignore
      new Date() - new Date(repo.groupSessionCreatedAt)
    );
    const diffdays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // NOTE Riot/Element creates new session, after ever 100th message.
    // Since in Serenity messages are smaller sent more often instead we focus
    // create new groupSessions based on a time difference of one day.
    if (diffdays < 1) {
      isOutdatedGroupSession = false;
    }
  }

  if (
    repo.groupSession &&
    !forceNewGroupSession &&
    !newGroupSessionNeeded &&
    !isOutdatedGroupSession
  ) {
    const groupSession = restoreGroupSession(repo.groupSession);
    const encryptedContent = createRepositoryUpdate(
      groupSession,
      currentDevice,
      uInt8ArrayToBase64(repo.content),
      repo.updatedAt
    );

    // important to update the repo with the new groupsession
    // to avoid inconsitencies between the device and the repo
    const repo2 = await repositoryStore.getRepository(repositoryId);
    await repositoryStore.setRepository({
      ...repo2,
      groupSession: serializeGroupSession(groupSession),
    });

    const result = await client
      .mutation(
        updateRepositoryContentMutation,
        {
          input: {
            repositoryId: repo.serverId,
            encryptedContent: encryptedContent,
            groupSessionMessageIds: repo.groupSessionMessageIds,
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

    if (!result.data?.updateRepositoryContent?.content?.encryptedContent)
      throw new Error("Failed to send content update to the server.");
  } else {
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

    const encryptedContent = createRepositoryUpdate(
      groupSession,
      currentDevice,
      uInt8ArrayToBase64(repo.content),
      repo.updatedAt
    );

    // important to update the repo with the new groupsession
    // to avoid inconsitencies between the device and the repo
    const repo2 = await repositoryStore.getRepository(repositoryId);
    await repositoryStore.setRepository({
      ...repo2,
      groupSession: serializeGroupSession(groupSession),
      groupSessionCreatedAt: new Date().toISOString(),
    });

    const result = await client
      .mutation(
        updateRepositoryContentAndGroupSessionMutation,
        {
          input: {
            repositoryId: repo.serverId,
            encryptedContent: encryptedContent,
            groupSessionMessages,
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

    if (
      result.data?.updateRepositoryContentAndGroupSession
        ?.groupSessionMessageIds
    ) {
      const repo2 = await repositoryStore.getRepository(repositoryId);
      await repositoryStore.setRepository({
        ...repo2,
        groupSessionMessageIds:
          result.data.updateRepositoryContentAndGroupSession
            .groupSessionMessageIds,
      });
    } else {
      throw new Error("Failed to send content update to the server.");
    }
  }
};

export default updateRepository;
