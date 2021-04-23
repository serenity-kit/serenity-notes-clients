import React from "react";
import { Text, StyleSheet } from "react-native";
import { sizes } from "../../styles/fonts";

const styles = StyleSheet.create({
  hint: {
    color: "#503b00",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#fff6dd",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    borderColor: "#c9a845",
    padding: sizes.medium * 0.8,
  },
});

type Props = {};

const MyText: React.FC<Props> = (props) => {
  return <Text style={styles.hint} {...props} />;
};

export default MyText;
