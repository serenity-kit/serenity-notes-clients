import React from "react";
import { ActivityIndicator as PaperActivityIndicator } from "react-native-paper";
import {
  ActivityIndicator as NativeActivityIndicator,
  Platform,
} from "react-native";

export default function ActivityIndicator(props) {
  if (Platform.OS === "macos") {
    return <NativeActivityIndicator {...props} />;
  }
  return <PaperActivityIndicator {...props} />;
}
