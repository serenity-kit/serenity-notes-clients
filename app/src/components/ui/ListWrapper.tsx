import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import useCurrentTheme from "../../hooks/useCurrentTheme";

const styles = StyleSheet.create({
  listWrapper: {
    overflow: "hidden",
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ListWrapper(props: Props) {
  const theme = useCurrentTheme();
  const style = props.style ? props.style : {};
  return (
    <View
      {...props}
      style={[
        styles.listWrapper,
        {
          borderColor: theme.colors.accent,
        },
        style,
      ]}
    />
  );
}
