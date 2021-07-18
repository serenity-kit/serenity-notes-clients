import React from "react";
import * as repositoryStore from "../stores/repositoryStore";
import { RepositoryStoreEntry } from "../types";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "repositories"; repositoryList: RepositoryStoreEntry[] };

export default function useRepositories(navigation): State {
  const [state, setState] = React.useState<State>({ type: "loading" });
  const subscriptionIdRef = React.useRef<string>();

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

    const unsubscribeNavigationFocus = navigation.addListener("focus", () => {
      loadRepositories();
      subscriptionIdRef.current = repositoryStore.subscribeToRepositories(
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
    });
    const unsubscribeNavigationBlur = navigation.addListener("blur", () => {
      if (subscriptionIdRef.current) {
        repositoryStore.unsubscribeToRepositories(subscriptionIdRef.current);
      }
    });
    return () => {
      unsubscribeNavigationFocus();
      unsubscribeNavigationBlur();
      if (subscriptionIdRef.current) {
        repositoryStore.unsubscribeToRepositories(subscriptionIdRef.current);
      }
    };
  }, [navigation]);

  return state;
}
