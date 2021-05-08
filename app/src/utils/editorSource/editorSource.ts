import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

export async function loadEditorSourceForAndroid() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const indexHtml = Asset.fromModule(require("../../assets/index.html"));
  await indexHtml.downloadAsync();
  const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
  return { html };
}
