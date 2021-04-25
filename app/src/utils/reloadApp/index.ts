import * as Updates from "expo-updates";

export async function reloadApp() {
  await Updates.reloadAsync();
}
