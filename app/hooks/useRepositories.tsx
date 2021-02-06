import React from "react";
import * as repositoryStore from "../utils/repositoryStore";
import { RepositoryListEntry } from "../types";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "repositories"; repositoryList: RepositoryListEntry[] };

export default function useRepositories(): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadRepositories = async () => {
      const repositoryList = await repositoryStore.getRepositoryList();
      if (repositoryList) {
        setState({ type: "repositories", repositoryList });
      } else {
        setState({ type: "notFound" });
      }
    };

    loadRepositories();
    const subscriptionId = repositoryStore.subscribeToRepositories(
      async (info) => {
        if (info) {
          setState({
            type: "repositories",
            repositoryList: info.repositoryList,
          });
        } else {
          setState({ type: "notFound" });
        }
      }
    );
    return () => {
      repositoryStore.unsubscribeToRepositories(subscriptionId);
    };
  }, []);

  return state;
}
