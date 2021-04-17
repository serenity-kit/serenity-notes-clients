import "react-native-get-random-values";
import React from "react";
import { Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "urql";
import { initOlm } from "./utils/device";
import { unlockScreenOrientation } from "./utils/screenOrientation";
import Navigation from "./components/Navigation";
import { initDeviceStore } from "./utils/deviceStore";
import { SyncInfoProvider } from "./context/SyncInfoContext";
import * as mutationQueueStore from "./stores/mutationQueueStore";
import { setRestoredMutations } from "./hooks/useSyncUtils/mutationQueue";
import client from "./utils/urqlClient";

export default function App() {
  const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    async function init() {
      try {
        await initOlm();
        await initDeviceStore();
        await unlockScreenOrientation();
        const existingMutations = await mutationQueueStore.getMutationQueue();
        setRestoredMutations(existingMutations);
        setInitialized(true);
      } catch (e) {
        Alert.alert("Failed to initialize encryption utilities.");
      }
    }
    init();
    console.log("Initialize Olm & crypto.getRandomValues");
  }, []);

  if (initialized === false) return null;

  return (
    <Provider value={client}>
      <StatusBar style="dark" />
      <SyncInfoProvider>
        <Navigation />
      </SyncInfoProvider>
    </Provider>
  );
}
