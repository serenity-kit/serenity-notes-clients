import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "react-native-elements";
import Spacer from "./Spacer";
import { Dimensions } from "react-native";

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  wrapper: {
    bottom: "40%",
    position: "absolute",
    width,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
});

type Props = {
  children: ReactNode;
  iconName: string;
};

export default function EmptyList(props: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Icon name={props.iconName} type="feather" color={"#000"} size={48} />
        <Spacer />
        {props.children}
      </View>
    </View>
  );
}
