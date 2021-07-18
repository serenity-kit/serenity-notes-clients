import deepEqual from "fast-deep-equal/es6";
import createRepository from "./createRepository";
import updateRepository from "./updateRepository";
import * as repositoryStore from "../../stores/repositoryStore";
import * as mutationQueueStore from "../../stores/mutationQueueStore";
import sleep from "../../utils/sleep";

export type Mutation = {
  repository: {
    id: string;
    serverId?: string;
  };
  forceNewGroupSession: boolean;
  retryCount: number;
};

export type RepositorySyncState = {
  state: "unknown" | "in-progress" | "retry-in-progress" | "success";
};

export type RepositoryErrorSyncState = {
  repositoryId: string;
  state: "retry-in-progress" | "success";
};

type RepositorySubscriptionCallback = (data: RepositorySyncState) => void;

export type RepositorySubscriptionEntry = {
  callback: RepositorySubscriptionCallback;
  subscriptionId: string;
  repositoryId: string;
};

type RepositoriesWithRetriesSubscriptionCallback = (
  data: RepositoryErrorSyncState
) => void;

export type RepositoriesWithRetriesSubscriptionEntry = {
  callback: RepositoriesWithRetriesSubscriptionCallback;
  subscriptionId: string;
};

const activeCreateRepositoryRequests = [];
const lastUpdateRepositories = {};
let mutations: Mutation[] = [];
let mutationInProgress: undefined | Mutation = undefined;
let queueIsActive = false;
let repositorySubscriptions: RepositorySubscriptionEntry[] = [];
let repositorySubscriptionsIdCounter = 0;
let repositoriesWithRetriesSubscriptions: RepositoriesWithRetriesSubscriptionEntry[] =
  [];
let repositoriesWithRetriesSubscriptionsIdCounter = 0;

// should only be used when restoring the mutations
export const setRestoredMutations = (restoredMutations: Mutation[]) => {
  console.log("Restored Mutations:", restoredMutations);
  mutations = restoredMutations;
  if (mutations.length > 0) {
    // start queue in case there were mutations in there
    runNextMutation();
  }
};

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
      await createRepository(mutation.repository.id);
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
        mutation.repository.id,
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

  repositoriesWithRetriesSubscriptions.forEach((entry) => {
    if (mutation.retryCount > 0) {
      entry.callback({
        repositoryId: mutation.repository.id,
        state: "retry-in-progress",
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
  // persist mutations before running one, so they can be restored in case the app gets closed
  await mutationQueueStore.setMutationQueue(mutations);
  // remove first mutation so one with the same id can be added again since
  // there could be another change and the latest change should always be synced
  mutations = mutations.slice(1);
  try {
    mutationInProgress = mutation;
    await execute(mutation);
    mutationInProgress = undefined;
    // not necessary to wait for it
    mutationQueueStore.setMutationQueue(mutations);
    repositorySubscriptions.forEach((entry) => {
      if (entry.repositoryId === mutation.repository.id) {
        entry.callback({ state: "success" });
      }
    });
    repositoriesWithRetriesSubscriptions.forEach((entry) => {
      if (mutation.retryCount > 0) {
        entry.callback({
          repositoryId: mutation.repository.id,
          state: "success",
        });
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
  // persist mutations with the latest changes
  await mutationQueueStore.setMutationQueue(mutations);
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

export const getRepositoryIdsWithRetries = () => {
  const repositoryIds = mutations
    .filter((mutation) => mutation.retryCount > 0)
    .map((mutation) => mutation.repository.id);
  return Array.from(new Set(repositoryIds));
};

export const subscribeToRepositoriesWithRetries = (
  callback: (syncState: RepositoryErrorSyncState) => void
) => {
  repositoriesWithRetriesSubscriptionsIdCounter++;
  const subscriptionId =
    repositoriesWithRetriesSubscriptionsIdCounter.toString();
  repositoriesWithRetriesSubscriptions.push({ callback, subscriptionId });
  return subscriptionId;
};

export const unsubscribeToRepositoriesWithRetries = (subscriptionId) => {
  repositoriesWithRetriesSubscriptions =
    repositoriesWithRetriesSubscriptions.filter(
      (entry) => entry.subscriptionId !== subscriptionId
    );
};
