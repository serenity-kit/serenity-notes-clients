import { Clipboard, Alert } from "react-native";

export default async function share(message: string) {
  await Clipboard.setString(message);
  Alert.alert("Copied to Clipboard");
}
