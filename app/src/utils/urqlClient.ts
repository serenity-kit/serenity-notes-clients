import { createClient, fetchExchange } from "urql";
import apiUrl from "./apiUrl/apiUrl";

const client = createClient({
  url: apiUrl,
  exchanges: [fetchExchange],
});

export default client;
