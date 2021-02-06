import "react-native-get-random-values";
import Constants from "expo-constants";
import React from "react";
import { Alert } from "react-native";
import { createClient, fetchExchange, Provider } from "urql";
import { initOlm } from "./utils/device";
import Navigation from "./components/Navigation";
import { initDeviceStore } from "./utils/deviceStore";
import { SyncInfoProvider } from "./context/SyncInfoContext";

const client = createClient({
  url: Constants.manifest.extra.apiUrl,
  exchanges: [fetchExchange],
});

export default function App() {
  const [initialized, setInitialized] = React.useState(false);
  React.useEffect(() => {
    async function init() {
      try {
        await initOlm();
        await initDeviceStore();
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
      <SyncInfoProvider>
        <Navigation />
      </SyncInfoProvider>
    </Provider>
  );
}
