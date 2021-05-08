import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";
import Spacer from "./Spacer";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

type Props = {
  children: ReactNode;
  iconName: string;
};

export default function EmptyList(props: Props) {
  return (
    <View style={styles.container}>
      <Icon name={props.iconName} type="feather" color={"#000"} size={48} />
      <Spacer />
      {props.children}
      {/* add two spacers to center it better vertically */}
      <Spacer />
      <Spacer />
    </View>
  );
}
