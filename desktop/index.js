import React from "react";
import { AppRegistry } from "react-native";
import App from "src/App";
import { name as appName } from "./app.json";

const editorSource = require("./assets/index-desktop.html");

AppRegistry.registerComponent(appName, () => () => (
  <App editorSource={editorSource} />
));
