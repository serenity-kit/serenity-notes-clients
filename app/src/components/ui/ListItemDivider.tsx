import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../../styles/colors";

export default function ListItemDivider() {
  return (
    <View
      style={{
        marginLeft: 10,
        marginRight: 10,
        borderColor: colors.divider,
        borderWidth: StyleSheet.hairlineWidth,
      }}
    />
  );
}
