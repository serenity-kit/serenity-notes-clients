import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  listWrapper: {
    overflow: "hidden",
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 10,
    borderColor: colors.divider,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ListWrapper(props: Props) {
  const style = props.style ? props.style : {};
  return <View {...props} style={[styles.listWrapper, style]} />;
}
