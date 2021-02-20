import deepEqual from "fast-deep-equal/es6";
import createRepository from "./createRepository";
import updateRepository from "./updateRepository";
import * as repositoryStore from "../../utils/repositoryStore";
import sleep from "../../utils/sleep";

export type Mutation = {
  repository: {
    id: string;
    serverId?: string;
  };
  utils: {
    client: any;
    fetchMyVerifiedDevices: any;
    executeCreateRepository: any;
    executeUpdateRepositoryContent: any;
    executeUpdateRepositoryContentAndGroupSession: any;
  };
  forceNewGroupSession: boolean;
  retryCount: number;
};

export type RepositorySyncState = {
  state: "unknown" | "in-progress" | "retry-in-progress" | "success";
};

type RepositorySubscriptionCallback = (data: RepositorySyncState) => void;

export type RepositorySubscriptionEntry = {
  callback: RepositorySubscriptionCallback;
  subscriptionId: string;
  repositoryId: string;
};

const activeCreateRepositoryRequests = [];
const lastUpdateRepositories = {};
let mutations: Mutation[] = [];
let mutationInProgress: undefined | Mutation = undefined;
let queueIsActive = false;
let repositorySubscriptions: RepositorySubscriptionEntry[] = [];
let repositorySubscriptionsIdCounter = 0;

const execute = async (mutation: Mutation) => {
  // need to check for the latest version of the repository in the store
  const repo = await repositoryStore.getRepository(mutation.repository.id);
  if (!repo.serverId) {
    if (activeCreateRepositoryRequests.includes(mutation.repository.id)) {
      return;
    }
    activeCreateRepositoryRequests.push(mutation.repository.id);
    let error: Error | undefined = undefined;
    try {
      await createRepository(
        mutation.utils.client,
        mutation.repository.id,
        mutation.utils.fetchMyVerifiedDevices,
        mutation.utils.executeCreateRepository
      );
    } catch (err) {
      error = err;
    } finally {
      // remove entry from array
      const index = activeCreateRepositoryRequests.indexOf(
        mutation.repository.id
      );
      if (index > -1) {
        activeCreateRepositoryRequests.splice(index, 1);
      }
    }
    console.log("error", error);
    if (error) {
      console.log("create failed");
      throw error;
    }
  } else {
    const restoreUpdateValue = lastUpdateRepositories[mutation.repository.id];
    const repository = await repositoryStore.getRepository(
      mutation.repository.id
    );

    if (
      mutation.forceNewGroupSession === false &&
      lastUpdateRepositories[mutation.repository.id] && // initially it's undefined
      deepEqual(
        repository.content,
        lastUpdateRepositories[mutation.repository.id].content
      )
    ) {
      // do not update if the content didn't change
      return;
    }

    try {
      lastUpdateRepositories[mutation.repository.id] = repository;
      await updateRepository(
        mutation.utils.client,
        mutation.repository.id,
        mutation.utils.executeUpdateRepositoryContent,
        mutation.utils.executeUpdateRepositoryContentAndGroupSession,
        mutation.forceNewGroupSession
      );
    } catch (err) {
      // restore lastUpdateRepository so the update can run again
      lastUpdateRepositories[mutation.repository.id] = restoreUpdateValue;
      throw err;
    }
  }
};

export const addMutation = async (mutation: Mutation) => {
  const hasMutationForRepositoryId = mutations.some(
    (existingMutation) =>
      existingMutation.repository.id === mutation.repository.id
  );
  if (hasMutationForRepositoryId) return;
  repositorySubscriptions.forEach((entry) => {
    if (entry.repositoryId === mutation.repository.id) {
      entry.callback({
        state:
          mutation.retryCount > 0 ||
          (mutationInProgress &&
            mutationInProgress.repository.id === mutation.repository.id &&
            mutationInProgress.retryCount > 0)
            ? "retry-in-progress"
            : "in-progress",
      });
    }
  });
  mutations.push(mutation);
  if (!queueIsActive) {
    await runNextMutation();
  }
};

const runNextMutation = async () => {
  queueIsActive = true;
  const mutation = mutations[0];
  // remove first mutation so one with the same id can be added again since
  // there could be another change and the latest change should always be synced
  mutations = mutations.slice(1);
  try {
    mutationInProgress = mutation;
    await execute(mutation);
    mutationInProgress = undefined;
    repositorySubscriptions.forEach((entry) => {
      if (entry.repositoryId === mutation.repository.id) {
        entry.callback({ state: "success" });
      }
    });
  } catch (err) {
    mutationInProgress = undefined;
    // re-add it at the end
    addMutation({
      ...mutation,
      retryCount: mutation.retryCount + 1,
    });
    if (mutation.retryCount > 2) {
      await sleep(2500);
    }
  }
  if (mutations.length > 0) {
    await runNextMutation();
  } else {
    queueIsActive = false;
  }
};

export const getRepositorySyncState = (
  repositoryId: string
): RepositorySyncState => {
  const mutation = mutations.find(
    (mutation) => mutation.repository.id === repositoryId
  );
  if (!mutation) return { state: "success" };
  if (mutation.retryCount > 0) {
    return {
      state: "retry-in-progress",
    };
  }
  return { state: "in-progress" };
};

export const subscribeToRepository = (
  repositoryId: string,
  callback: (syncState: RepositorySyncState) => void
) => {
  repositorySubscriptionsIdCounter++;
  const subscriptionId = repositorySubscriptionsIdCounter.toString();
  repositorySubscriptions.push({ callback, subscriptionId, repositoryId });
  return subscriptionId;
};

export const unsubscribeToRepository = (subscriptionId) => {
  repositorySubscriptions = repositorySubscriptions.filter(
    (entry) => entry.subscriptionId !== subscriptionId
  );
};
