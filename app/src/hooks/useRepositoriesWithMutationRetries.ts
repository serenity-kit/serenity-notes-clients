import React from "react";
import * as mutationQueue from "./useSyncUtils/mutationQueue";

export default function useRepositoriesWithMutationRetries(navigation) {
  const [repositoriesWithRetries, setRepositoriesWithRetries] = React.useState(
    mutationQueue.getRepositoryIdsWithRetries()
  );
  const subscriptionIdRef = React.useRef<string>();

  React.useEffect(() => {
    const unsubscribeNavigationFocus = navigation.addListener("focus", () => {
      setRepositoriesWithRetries(mutationQueue.getRepositoryIdsWithRetries());
      subscriptionIdRef.current = mutationQueue.subscribeToRepositoriesWithRetries(
        (data) => {
          if (data.state === "retry-in-progress") {
            setRepositoriesWithRetries((currentRepositoriesWithRetries) => {
              if (currentRepositoriesWithRetries.includes(data.repositoryId)) {
                return currentRepositoriesWithRetries;
              }
              return currentRepositoriesWithRetries.concat([data.repositoryId]);
            });
          } else if (data.state === "success") {
            setRepositoriesWithRetries((currentRepositoriesWithRetries) => {
              return currentRepositoriesWithRetries.filter(
                (id) => id !== data.repositoryId
              );
            });
          }
        }
      );
    });
    const unsubscribeNavigationBlur = navigation.addListener("blur", () => {
      if (subscriptionIdRef.current) {
        mutationQueue.unsubscribeToRepositoriesWithRetries(
          subscriptionIdRef.current
        );
      }
    });

    return () => {
      unsubscribeNavigationFocus();
      unsubscribeNavigationBlur();
      if (subscriptionIdRef.current) {
        mutationQueue.unsubscribeToRepositoriesWithRetries(
          subscriptionIdRef.current
        );
      }
    };
  }, [navigation]);

  return repositoriesWithRetries;
}
