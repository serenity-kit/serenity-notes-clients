import React from "react";
import { Platform } from "react-native";
import { AppearanceProvider, useColorScheme } from "react-native-appearance";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import App from "./src/App";

const editorSource =
  Platform.OS !== "android"
    ? require("./src/assets/index.html")
    : { html: null };

export default function Root() {
  const isDark = useColorScheme() === "dark";
  const style: StatusBarStyle = isDark ? "light" : "dark";
  return (
    <AppearanceProvider>
      <>
        <StatusBar style={style} />
        <App editorSource={editorSource} />
      </>
    </AppearanceProvider>
  );
}
