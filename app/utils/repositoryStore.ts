import AsyncStorage from "@react-native-async-storage/async-storage";
import deepEqual from "fast-deep-equal/es6";

import { uInt8ArrayToBase64, base64ToUInt8Array } from "./encoding";
import {
  Repository,
  RepositoryListEntry,
  PickledGroupSession,
  RepositoryCollaborator,
  RepositoryUpdate,
} from "../types";
import * as yUtils from "../utils/yUtils";

type RepositorySubscriptionCallback = (repository?: Repository) => void;

type RepositorySubscriptionEntry = {
  repositoryId: string;
  subscriptionId: string;
  callback: RepositorySubscriptionCallback;
};

type RepositoriesSubscriptionCallbackArgument =
  | {
      repositoryList: RepositoryListEntry[];
      repository: Repository;
      type: "createdOne" | "updatedOne";
    }
  | {
      repositoryList: RepositoryListEntry[];
      type: "deletedOne";
    }
  | {
      repositoryList: RepositoryListEntry[];
      type: "deletedAll";
    };

type RepositoriesSubscriptionCallback = (
  info: RepositoriesSubscriptionCallbackArgument
) => void;

type RepositoriesSubscriptionEntry = {
  subscriptionId: string;
  callback: RepositoriesSubscriptionCallback;
};

type RepositoryStoreEntry = {
  id: string;
  name: string;
  content: string;
  format: "yjs-13-base64";
  serverId?: string;
  groupSession?: PickledGroupSession;
  groupSessionCreatedAt?: string;
  groupSessionMessageIds?: string[];
  collaborators?: RepositoryCollaborator[];
  updates?: RepositoryUpdate[];
  lastContentUpdateIntegrityId?: string;
  updatedAt?: string;
};

type RepositoryInput = {
  id: string;
  content: Uint8Array;
  format: "yjs-13-base64";
  serverId?: string;
  groupSession?: PickledGroupSession;
  groupSessionCreatedAt?: string;
  groupSessionMessageIds?: string[];
  collaborators?: RepositoryCollaborator[];
  isCreator?: boolean;
  updates?: RepositoryUpdate[];
  lastContentUpdateIntegrityId?: string;
  updatedAt?: string;
};

let repositoryStoreSubscriptions: RepositorySubscriptionEntry[] = [];
let repositoryStoreIdCounter = 0;

let repositoriesStoreSubscriptions: RepositoriesSubscriptionEntry[] = [];
let repositoriesStoreIdCounter = 0;

export const getRepositoryList = async (): Promise<RepositoryListEntry[]> => {
  return JSON.parse((await AsyncStorage.getItem("repos")) || "[]");
};

export const setRepository = async (repositoryInput: RepositoryInput) => {
  const name = yUtils.extractDocumentName(repositoryInput.content);
  const storedRepo = await getRepository(repositoryInput.id);

  const initialValue: any[] = [];
  const existingUpdates = storedRepo?.updates ? storedRepo.updates : [];
  const newUpdates = repositoryInput?.updates ? repositoryInput.updates : [];
  const updates = [...existingUpdates, ...newUpdates].reduce(
    (accumulator, nextUpdate) => {
      // remove the update for the device to only have one update per device
      const tmpUpdates = accumulator.filter(
        (update) => update.authorDeviceKey !== nextUpdate.authorDeviceKey
      );
      // add the new device
      return tmpUpdates.concat([nextUpdate]);
    },
    initialValue
  );

  const repository = {
    ...repositoryInput,
    name: name.substring(0, 70),
    updates,
  };

  if (storedRepo) {
    const repoToCompare = {
      ...storedRepo,
      ...repository,
    };
    // avoid update if nothing changed
    const isDeepEqual = deepEqual(storedRepo, repoToCompare);
    if (isDeepEqual) return;
  }

  // TODO use storred repo to avoid overwritting existing props (make sure to cover create & update case)
  const repo: RepositoryStoreEntry = {
    ...repository,
    format: "yjs-13-base64",
    content: uInt8ArrayToBase64(repository.content),
  };

  function calculateLastUpdatedAt(updates?: RepositoryUpdate[]) {
    if (!updates || updates.length === 0) return new Date().toISOString();
    const mostRecentUpdate = updates.sort(
      (updateA, updateB) =>
        // @ts-ignore
        new Date(updateB.createdAt) - new Date(updateA.createdAt)
    )[0];
    return mostRecentUpdate.createdAt;
  }

  const repos = await getRepositoryList();
  // find if the repo exists using findIndex
  const repoIndex = repos.findIndex((repo) => repo.id === repository.id);
  const isNewRepo = repoIndex === -1;
  if (isNewRepo) {
    repos.push({
      id: repository.id,
      name: repository.name,
      serverId: repository.serverId,
      collaborators: repository.collaborators,
      updatedAt: repository.updatedAt || storedRepo?.updatedAt,
      lastUpdatedAt: repository.updatedAt || storedRepo?.updatedAt,
      lastContentUpdateIntegrityId: repository.lastContentUpdateIntegrityId,
    });
  } else {
    repos[repoIndex] = {
      id: repository.id,
      name: repository.name,
      serverId: repository.serverId,
      collaborators: repository.collaborators,
      updatedAt:
        repository.updatedAt ||
        storedRepo?.updatedAt ||
        // TODO deprecated, should be removed once version <1.3.0 is not used anymore
        calculateLastUpdatedAt(repository.updates),
      lastUpdatedAt:
        repository.updatedAt ||
        storedRepo?.updatedAt ||
        // TODO deprecated, should be removed once version <1.3.0 is not used anymore
        calculateLastUpdatedAt(repository.updates),
      lastContentUpdateIntegrityId: repository.lastContentUpdateIntegrityId,
    };
  }

  await AsyncStorage.setItem("repos", JSON.stringify(repos));
  const result = await AsyncStorage.setItem(
    `repo${repository.id}`,
    JSON.stringify(repo)
  );

  const subscriptionRepo = {
    ...repo,
    content: base64ToUInt8Array(repo.content),
  };
  repositoryStoreSubscriptions.forEach((entry) => {
    if (entry.repositoryId === repo.id) {
      entry.callback(subscriptionRepo);
    }
  });
  repositoriesStoreSubscriptions.forEach((entry) => {
    if (isNewRepo) {
      entry.callback({
        repositoryList: repos,
        repository: subscriptionRepo,
        type: "createdOne",
      });
    } else {
      entry.callback({
        repositoryList: repos,
        repository: subscriptionRepo,
        type: "updatedOne",
      });
    }
  });
  return result;
};

export const getRepository = async (id: string): Promise<Repository | null> => {
  const repoString = await AsyncStorage.getItem(`repo${id}`);
  if (!repoString) return null;
  const rawRepo = JSON.parse(repoString);
  return {
    ...rawRepo,
    content: base64ToUInt8Array(rawRepo.content),
  };
};

export const getRepositoryByServerId = async (serverId: string) => {
  const reposInfo = await getRepositoryList();
  const repoInfo = reposInfo.find((repoInfo: any) => {
    return repoInfo.serverId === serverId;
  });
  if (!repoInfo) return null;
  return await getRepository(repoInfo.id);
};

export const deleteRepository = async (repositoryId: string) => {
  const reposInfo = await getRepositoryList();
  const filteredReposInfo = reposInfo.filter(
    (info) => info.id !== repositoryId
  );
  await AsyncStorage.removeItem(`repo${repositoryId}`);
  await AsyncStorage.setItem("repos", JSON.stringify(filteredReposInfo));

  repositoryStoreSubscriptions.forEach((entry) => {
    if (entry.repositoryId === repositoryId) {
      entry.callback(null);
    }
  });
  repositoriesStoreSubscriptions.forEach((entry) => {
    entry.callback({
      repositoryList: filteredReposInfo,
      type: "deletedOne",
    });
  });
};

export const deleteRepositories = async () => {
  const reposInfo = await getRepositoryList();
  const keys = reposInfo.map((info) => `repo${info.id}`);
  await AsyncStorage.multiRemove([...keys, "repos"]);
  repositoryStoreSubscriptions.forEach((entry) => {
    entry.callback(null);
  });
  repositoriesStoreSubscriptions.forEach((entry) => {
    entry.callback({ repositoryList: [], type: "deletedAll" });
  });
};

export const subscribeToRepositories = (
  callback: RepositoriesSubscriptionCallback
) => {
  repositoriesStoreIdCounter++;
  const subscriptionId = repositoriesStoreIdCounter.toString();
  repositoriesStoreSubscriptions.push({ callback, subscriptionId });
  return subscriptionId;
};

export const unsubscribeToRepositories = (subscriptionId: string) => {
  repositoriesStoreSubscriptions = repositoriesStoreSubscriptions.filter(
    (entry) => entry.subscriptionId !== subscriptionId
  );
};

export const subscribeToRepository = (
  repositoryId: string,
  callback: RepositorySubscriptionCallback
) => {
  repositoryStoreIdCounter++;
  const subscriptionId = repositoryStoreIdCounter.toString();
  repositoryStoreSubscriptions.push({ callback, subscriptionId, repositoryId });
  return subscriptionId;
};

export const unsubscribeToRepository = (subscriptionId) => {
  repositoryStoreSubscriptions = repositoryStoreSubscriptions.filter(
    (entry) => entry.subscriptionId !== subscriptionId
  );
};
