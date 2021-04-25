import { Platform } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';

export async function unlockScreenOrientation() {
  if (Platform.OS === 'ios' && Platform.isPad) {
    await ScreenOrientation.unlockAsync();
  }
}
