import Constants from "expo-constants";
import { createClient, fetchExchange } from "urql";

const client = createClient({
  url: Constants.manifest.extra.apiUrl,
  exchanges: [fetchExchange],
});

export default client;
