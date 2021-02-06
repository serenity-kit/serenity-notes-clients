import React from "react";
import * as repositoryStore from "../utils/repositoryStore";
import { Repository } from "../types";

type State =
  | { type: "loading" }
  | { type: "notFound" }
  | { type: "repository"; repository: Repository };

export default function useRepository(repositoryId: string): State {
  const [state, setState] = React.useState<State>({ type: "loading" });

  React.useEffect(() => {
    const loadRepositories = async () => {
      const repository = await repositoryStore.getRepository(repositoryId);
      if (repository) {
        setState({ type: "repository", repository });
      } else {
        setState({ type: "notFound" });
      }
    };

    loadRepositories();
    const subscriptionId = repositoryStore.subscribeToRepository(
      repositoryId,
      async (repository) => {
        if (repository) {
          setState({
            type: "repository",
            repository: repository,
          });
        } else {
          setState({ type: "notFound" });
        }
      }
    );
    return () => {
      repositoryStore.unsubscribeToRepository(subscriptionId);
    };
  }, []);

  return state;
}
