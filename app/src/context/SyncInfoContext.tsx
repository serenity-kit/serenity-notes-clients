import React from "react";

export type SyncStateInput =
  | { type: "inprogress" }
  | { type: "success" }
  | { type: "failed"; error: any; errorType: "UNKOWN" | "NETWORK" };

export type SyncState =
  | { type: "inprogress" }
  | { type: "success"; datetime: Date }
  | {
      type: "failed";
      datetime: Date;
      error: any;
      errorType: "UNKOWN" | "NETWORK";
      lastSuccessDatetime: Date;
    };

type SyncStateContext = {
  loadRepositoriesSyncState: SyncState;
  setLoadRepositoriesSyncState: (syncState: SyncStateInput) => void;
};

const SyncInfoContext = React.createContext<SyncStateContext>({
  loadRepositoriesSyncState: { type: "inprogress" },
  setLoadRepositoriesSyncState: () => undefined,
});

export const SyncInfoProvider = ({ children }) => {
  const [
    loadRepositoriesSyncState,
    setInternalLoadRepositoriesSyncState,
  ] = React.useState<SyncState>({ type: "inprogress" });

  const setLoadRepositoriesSyncState = (syncState: SyncStateInput) => {
    if (syncState.type === "inprogress") {
      setInternalLoadRepositoriesSyncState(syncState);
    } else {
      const lastSuccessDatetime =
        loadRepositoriesSyncState.type === "success"
          ? loadRepositoriesSyncState.datetime
          : loadRepositoriesSyncState.type === "failed"
          ? loadRepositoriesSyncState.lastSuccessDatetime
          : null;
      setInternalLoadRepositoriesSyncState(
        syncState.type === "success"
          ? {
              ...syncState,
              datetime: new Date(),
            }
          : {
              ...syncState,
              datetime: new Date(),
              lastSuccessDatetime,
            }
      );
    }
  };

  return (
    <SyncInfoContext.Provider
      value={{
        loadRepositoriesSyncState,
        setLoadRepositoriesSyncState,
      }}
    >
      {children}
    </SyncInfoContext.Provider>
  );
};

export const useSyncInfo = () => React.useContext(SyncInfoContext);
