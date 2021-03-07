import React from "react";
import { AppState, AppStateStatus } from "react-native";
import { useClient } from "urql";
import useDevice from "./useDevice";
import useUser from "./useUser";
import usePrivateUserSigningKey from "./usePrivateUserSigningKey";
import repositoriesQuery from "../graphql/repositoriesQuery";
import { createAuthenticationToken } from "../utils/device";
import { updateYDocWithContentEntries } from "../utils/updateYDocWithContentEntries";
import { Y } from "../vendor/index.js";
import * as repositoryStore from "../utils/repositoryStore";
import * as Random from "expo-random";
import { v4 as uuidv4 } from "uuid";
import * as mutationQueue from "./useSyncUtils/mutationQueue";
import useMyVerifiedDevices from "../hooks/useMyVerifiedDevices";
import unclaimedOneTimeKeysCount from "../utils/server/unclaimedOneTimeKeysCount";
import sendOneTimeKeys from "../utils/server/sendOneTimeKeys";
import { useSyncInfo, SyncStateInput } from "../context/SyncInfoContext";

type CollaboratorFromServer = { id: string };

type RepositoryResultFromServer = {
  __typename: "Repository" | "RepositoryTombstone";
  id: string;
  content: any[];
  collaborators: CollaboratorFromServer[];
  isCreator: boolean;
  lastContentUpdateIntegrityId: string;
};

let syncInProgress = false;

const getuuid = async (): Promise<string> =>
  uuidv4({ random: await Random.getRandomBytesAsync(16) });

const fetchRepositories = async (
  client: any,
  device: Olm.Account,
  setLoadRepositoriesSyncState: (syncState: SyncStateInput) => void
) => {
  try {
    const repositoryList = await repositoryStore.getRepositoryList();
    const lastContentUpdateIntegrityIdsByRepository = repositoryList
      .filter((repo) => repo.lastContentUpdateIntegrityId)
      .map((repo) => {
        return {
          repositoryId: repo.serverId,
          lastContentUpdateIntegrityId: repo.lastContentUpdateIntegrityId,
        };
      });

    const result = await client
      .query(
        repositoriesQuery,
        { lastContentUpdateIntegrityIdsByRepository },
        {
          fetchOptions: {
            headers: {
              authorization: `signed-utc-msg ${createAuthenticationToken(
                device
              )}`,
            },
          },
        }
      )
      .toPromise();

    if (result?.data?.allRepositories) {
      result?.data?.allRepositories.forEach(
        async (repo: RepositoryResultFromServer) => {
          if (repo.__typename === "RepositoryTombstone") {
            const localRepo = await repositoryStore.getRepositoryByServerId(
              repo.id
            );
            if (localRepo) {
              repositoryStore.deleteRepository(localRepo.id);
            }
            return;
          }
          try {
            const localRepo = await repositoryStore.getRepositoryByServerId(
              repo.id
            );
            const yDoc = new Y.Doc();
            if (localRepo) {
              // Filter out the already decrypted contentEntries to avoid
              // unnecessarily decrypting already decrypted entries.
              // This should not be necessary since by sending the
              // lastContentUpdateIntegrityIdsByRepository no duplicated entry
              // should come back, but better be safe than sorry …
              const contentEntries = repo.content.filter((contentEntry) => {
                if (!localRepo.updates) return false;
                const contentEntryAlreadyDecryted = localRepo.updates.some(
                  (update) => update.contentId === contentEntry.id
                );
                return !contentEntryAlreadyDecryted;
              });
              Y.applyUpdate(yDoc, localRepo.content);

              const { updates, updatedAt } = await updateYDocWithContentEntries(
                yDoc,
                contentEntries,
                localRepo.id,
                localRepo.updatedAt,
                client
              );
              await repositoryStore.setRepository({
                ...localRepo,
                lastContentUpdateIntegrityId: repo.lastContentUpdateIntegrityId,
                content: Y.encodeStateAsUpdate(yDoc),
                collaborators: repo.collaborators,
                isCreator: repo.isCreator,
                updates,
                updatedAt,
              });
            } else {
              // new repository coming from the server
              const id = await getuuid();
              const { updates, updatedAt } = await updateYDocWithContentEntries(
                yDoc,
                repo.content,
                id,
                undefined,
                client
              );
              await repositoryStore.setRepository({
                id,
                serverId: repo.id,
                lastContentUpdateIntegrityId: repo.lastContentUpdateIntegrityId,
                content: Y.encodeStateAsUpdate(yDoc),
                format: "yjs-13-base64",
                collaborators: repo.collaborators,
                isCreator: repo.isCreator,
                updates,
                updatedAt,
              });
            }
          } catch (err) {
            console.warn("Failed to decrypt:", repo.id);
            console.warn(err);
          }
        }
      );
      setLoadRepositoriesSyncState({ type: "success" });
    } else {
      setLoadRepositoriesSyncState({
        type: "failed",
        error: result.error?.message
          ? result.error.message
          : "Missing message.",
        errorType: result.error?.networkError ? "NETWORK" : "UNKOWN",
      });
    }
  } catch (err) {
    console.log("Unknown fetchRepositories error.");
    setLoadRepositoriesSyncState({
      type: "failed",
      error: "Unknown fetchRepositories error.",
      errorType: "UNKOWN",
    });
  }
};

const useSync = () => {
  const { setLoadRepositoriesSyncState } = useSyncInfo();
  const client = useClient();
  const deviceResult = useDevice();
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState
  );
  const appWasInactive = React.useRef<boolean>(true);

  const changeAppState = (nextAppState) => {
    setAppState(nextAppState);
    if (appState === "active" && nextAppState !== "active") {
      appWasInactive.current = true;
    }
  };

  React.useEffect(() => {
    AppState.addEventListener("change", changeAppState);

    return () => {
      AppState.removeEventListener("change", changeAppState);
    };
  }, []);

  React.useEffect(() => {
    if (
      deviceResult.type !== "device" ||
      userResult.type !== "user" ||
      privateUserSigningKeyResult.type !== "privateUserSigningKey" ||
      appState !== "active" // don't fetch if the app is in background
    )
      return;

    if (appWasInactive.current) {
      const fetchRepositoriesWithSyncInProgressCheck = async () => {
        if (syncInProgress) return;
        syncInProgress = true;
        await fetchRepositories(
          client,
          deviceResult.device,
          setLoadRepositoriesSyncState
        );
        syncInProgress = false;
      };

      appWasInactive.current = false;
      // fetch right away when the device gets activated
      // Note: await is not used in useEffect
      fetchRepositoriesWithSyncInProgressCheck();
    }

    const intervalId = setInterval(async () => {
      if (syncInProgress) return;
      syncInProgress = true;
      await fetchRepositories(
        client,
        deviceResult.device,
        setLoadRepositoriesSyncState
      );
      try {
        const unclaimedOneTimeKeysCountValue = await unclaimedOneTimeKeysCount(
          client,
          deviceResult.device
        );
        // TODO fetch the claimed & unclaimed oneTimeKeys
        // then only if the amount is lower than
        // deviceResult.device.max_number_of_one_time_keys()
        // start to send more
        if (unclaimedOneTimeKeysCountValue < 50) {
          await sendOneTimeKeys(client, deviceResult.device);
        }
      } catch (err) {
        console.log("Failed to fetch unclaimedOneTimeKeysCount");
        // TODO track errors and notify user if this doesn't work for a long time
      }
      syncInProgress = false;
    }, 4000); // TODO switch to an interval defined by server or with backup

    return () => {
      clearInterval(intervalId);
    };
  }, [
    deviceResult,
    userResult,
    privateUserSigningKeyResult,
    setLoadRepositoriesSyncState,
    appState,
  ]);

  React.useEffect(() => {
    if (
      deviceResult.type !== "device" ||
      userResult.type !== "user" ||
      privateUserSigningKeyResult.type !== "privateUserSigningKey"
    )
      return;

    const subscriptionId = repositoryStore.subscribeToRepositories(
      async (info) => {
        if (info.type === "createdOrUpdatedOne") {
          mutationQueue.addMutation({
            repository: {
              id: info.repository.id,
              serverId: info.repository.serverId,
            },
            forceNewGroupSession: false,
            retryCount: 0,
          });
        }
      }
    );

    return () => {
      repositoryStore.unsubscribeToRepositories(subscriptionId);
    };
  }, [
    deviceResult,
    userResult,
    privateUserSigningKeyResult,
    fetchMyVerifiedDevices,
  ]);

  const encryptAndUploadAllRepositories = React.useCallback(async () => {
    // NOTE due fallbackKeys there always will be one key for each device
    const repos = await repositoryStore.getRepositoryList();
    repos.forEach((repository) => {
      mutationQueue.addMutation({
        repository: {
          id: repository.id,
          serverId: repository.serverId,
        },
        forceNewGroupSession: true,
        retryCount: 0,
      });
    });
  }, [fetchMyVerifiedDevices]);

  return {
    encryptAndUploadAllRepositories,
  };
};

export default useSync;
