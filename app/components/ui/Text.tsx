import React from "react";
import { Text, StyleSheet } from "react-native";
import { sizes } from "../../styles/fonts";

const styles = StyleSheet.create({
  textSmallBlack: {
    fontSize: sizes.small,
    lineHeight: sizes.small * 1.4,
  },
  textSmallBoldBlack: {
    fontSize: sizes.small,
    lineHeight: sizes.small * 1.4,
    fontWeight: "bold",
  },
  textSmallGrey: {
    fontSize: sizes.small,
    lineHeight: sizes.small * 1.4,
    color: "#aaa",
  },
  textSmallBoldGrey: {
    fontSize: sizes.small,
    lineHeight: sizes.small * 1.4,
    fontWeight: "bold",
    color: "#aaa",
  },
  textMediumBlack: {
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
  },
  textMediumBoldBlack: {
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    fontWeight: "bold",
  },
  textMediumGrey: {
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    color: "#aaa",
  },
  textMediumBoldGrey: {
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    fontWeight: "bold",
    color: "#aaa",
  },
  textLargeBlack: {
    fontSize: sizes.large,
    lineHeight: sizes.large * 1.4,
  },
  textLargeBoldBlack: {
    fontSize: sizes.large,
    lineHeight: sizes.large * 1.4,
    fontWeight: "bold",
  },
  textLargeGrey: {
    fontSize: sizes.large,
    lineHeight: sizes.large * 1.4,
    color: "#aaa",
  },
  textLargeBoldGrey: {
    fontSize: sizes.large,
    lineHeight: sizes.large * 1.4,
    fontWeight: "bold",
    color: "#aaa",
  },
});

type Props = {
  size?: "s" | "m" | "l";
  weight?: "default" | "bold";
  color?: "default" | "grey";
};

const MyText: React.FC<Props> = (props) => {
  if (props.size === "s") {
    return (
      <Text
        style={
          props.color === "grey"
            ? props.weight === "bold"
              ? styles.textSmallBoldGrey
              : styles.textSmallGrey
            : props.weight === "bold"
            ? styles.textSmallBoldBlack
            : styles.textSmallBlack
        }
        {...props}
      />
    );
  }
  if (props.size === "l") {
    return (
      <Text
        style={
          props.color === "grey"
            ? props.weight === "bold"
              ? styles.textLargeBoldGrey
              : styles.textLargeGrey
            : props.weight === "bold"
            ? styles.textLargeBoldBlack
            : styles.textLargeBlack
        }
        {...props}
      />
    );
  }

  return (
    <Text
      style={
        props.color === "grey"
          ? props.weight === "bold"
            ? styles.textMediumBoldGrey
            : styles.textMediumGrey
          : props.weight === "bold"
          ? styles.textMediumBoldBlack
          : styles.textMediumBlack
      }
      {...props}
    />
  );
};

export default MyText;
