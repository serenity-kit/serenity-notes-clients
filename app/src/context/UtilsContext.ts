import React from "react";

type Utils = {
  encryptAndUploadAllRepositories: () => void;
};

const UtilsContext = React.createContext<Utils>({
  encryptAndUploadAllRepositories: () => undefined,
});

export const UtilsProvider = UtilsContext.Provider;
export const useUtilsContext = () => React.useContext(UtilsContext);
