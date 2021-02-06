import { Alert } from "react-native";
import deepEqual from "fast-deep-equal/es6";
import createRepository from "./createRepository";
import updateRepository from "./updateRepository";
import * as repositoryStore from "../../utils/repositoryStore";

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
};

const activeCreateRepositoryRequests = [];
const lastUpdateRepositories = {};
let mutations: Mutation[] = [];
let queueIsActive = false;

const execute = async (mutation: Mutation) => {
  // need to check for the latest version of the repository in the store
  const repo = await repositoryStore.getRepository(mutation.repository.id);
  if (!repo.serverId) {
    if (activeCreateRepositoryRequests.includes(mutation.repository.id)) {
      return;
    }
    activeCreateRepositoryRequests.push(mutation.repository.id);
    try {
      await createRepository(
        mutation.utils.client,
        mutation.repository.id,
        mutation.utils.fetchMyVerifiedDevices,
        mutation.utils.executeCreateRepository
      );
    } catch (e) {
      Alert.alert(
        "Failed to create the repository on the server. Will try again …"
      );
    } finally {
      // remove entry from array
      const index = activeCreateRepositoryRequests.indexOf(
        mutation.repository.id
      );
      if (index > -1) {
        activeCreateRepositoryRequests.splice(index, 1);
      }
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
    } catch (e) {
      console.log("Run server update fails", e);
      // restore lastUpdateRepository so the update can run again
      lastUpdateRepositories[mutation.repository.id] = restoreUpdateValue;
      Alert.alert(
        "Failed to update the repository on the server. Will try again …"
      );
    }
  }
};

export const addMutation = async (mutation: Mutation) => {
  mutations.push(mutation);
  if (!queueIsActive) {
    await runNextMutation();
  }
};

const runNextMutation = async () => {
  queueIsActive = true;
  const mutation = mutations[0];
  mutations = mutations.slice(1); // remove first mutation
  await execute(mutation);
  if (mutations.length > 0) {
    await runNextMutation();
  } else {
    queueIsActive = false;
  }
};
