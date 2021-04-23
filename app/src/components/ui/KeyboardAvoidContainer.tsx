import React from "react";
import { Platform, KeyboardAvoidingView } from "react-native";
import { HeaderHeightContext } from "@react-navigation/stack";

type Props = {};

const KeyboardAvoidContainer: React.FC<Props> = (props) => {
  return (
    <HeaderHeightContext.Consumer>
      {(headerHeight) => {
        return (
          <KeyboardAvoidingView
            {...(Platform.OS === "ios" ? { behavior: "padding" } : {})}
            style={{ display: "flex", flex: 1 }}
            // react-navigation header + extra padding
            keyboardVerticalOffset={headerHeight}
          >
            {props.children}
          </KeyboardAvoidingView>
        );
      }}
    </HeaderHeightContext.Consumer>
  );
};

export default KeyboardAvoidContainer;
