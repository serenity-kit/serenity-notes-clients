import * as Haptics from "expo-haptics";

export default async function hapticFeedback() {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
