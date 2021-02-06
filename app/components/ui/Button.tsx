import React from "react";
import { Button } from "react-native-paper";

export default function MyButton(props) {
  return (
    <Button
      {...props}
      uppercase={false}
      mode={props.mode || "contained"}
      labelStyle={{ fontSize: 16 }}
      contentStyle={props.contentStyle || { height: 60 }}
    />
  );
}
