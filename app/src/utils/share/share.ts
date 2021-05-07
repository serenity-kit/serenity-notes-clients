import { Share } from "react-native";

export default async function share(message: string) {
  return await Share.share({ message });
}
