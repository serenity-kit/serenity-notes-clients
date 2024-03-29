import "react-native-get-random-values";
import React from "react";
import { Alert, Platform } from "react-native";
import { Provider } from "urql";
import { initOlm } from "./utils/device";
import { unlockScreenOrientation } from "./utils/screenOrientation";
import Navigation from "./components/Navigation";
import { initDeviceStore } from "./stores/deviceStore";
import { initDebugStore } from "./stores/debugStore";
import { SyncInfoProvider } from "./context/SyncInfoContext";
import * as mutationQueueStore from "./stores/mutationQueueStore";
import { setRestoredMutations } from "./hooks/useSyncUtils/mutationQueue";
import client from "./utils/urqlClient";
import { EditorSourceContext } from "./context/EditorSourceContext";
import UpgradeHint from "./components/ui/UpgradeHint";
import { initOneTimeKeysFailedToRemoveFromServer } from "./stores/oneTimeKeysFailedToRemoveFromServerStore";

type Props = {
  editorSource: any;
};

export default function App({ editorSource }: Props) {
  const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    async function init() {
      try {
        await initOlm();
        await initDebugStore();
        // NOTE: The currentDevice is storred in the module instead of React's state or context
        // This can cause issue for hot-reloading while editing the deviceStore file.
        // Steps to reproduce:
        // 1. Open the contacts screen
        // 2. Change the deviceStore file
        // -> The useDevice hook will run, but not find device since the deviceStore module
        // is empty at the moment.
        // Fix: In this case just restart the App or change the contacts screen file to trigger
        // a reload there.
        await initDeviceStore();
        await initOneTimeKeysFailedToRemoveFromServer();
        await unlockScreenOrientation();
        const existingMutations = await mutationQueueStore.getMutationQueue();
        setRestoredMutations(existingMutations);
        setInitialized(true);
      } catch (err) {
        Alert.alert("Failed to initialize encryption utilities.", err);
        console.error(err);
      }
    }
    init();
    console.log("Initialize App");
  }, []);

  if (initialized === false) return null;

  return (
    <EditorSourceContext.Provider value={editorSource}>
      <Provider value={client}>
        <SyncInfoProvider>
          {Platform.OS === "macos" ? <UpgradeHint /> : null}
          <Navigation />
        </SyncInfoProvider>
      </Provider>
    </EditorSourceContext.Provider>
  );
}
