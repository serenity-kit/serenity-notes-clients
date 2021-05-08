import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  spacerSmall: {
    height: 10,
  },
  spacerMedium: {
    height: 20,
  },
});

type Props = {
  size?: "s" | "m" | "l";
};

const Spacer: React.FC<Props> = (props) => {
  return (
    <View
      style={props.size === "s" ? styles.spacerSmall : styles.spacerMedium}
    />
  );
};

export default Spacer;
