import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import App from "./src/App";

const editorSource =
  Platform.OS !== "android"
    ? require("./src/assets/index.html")
    : { html: null };

export default function Root() {
  return (
    <>
      <StatusBar style="dark" />
      <App editorSource={editorSource} />
    </>
  );
}
