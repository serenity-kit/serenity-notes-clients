import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import useCurrentTheme, { DerivedTheme } from "../../hooks/useCurrentTheme";

import { sizes } from "../../styles/fonts";

type Props = {
  size?: "s" | "m" | "l";
  weight?: "default" | "bold";
  color?: "default" | "grey";
  style?: StyleProp<TextStyle>;
};

const getTextStyles = (
  { size, color, weight }: Props,
  theme: DerivedTheme
): StyleProp<TextStyle> => {
  const fontSize =
    size === "s" ? sizes.small : size === "l" ? sizes.large : sizes.medium;
  const lineHeight = fontSize * 1.4;
  const textColor =
    color === "default" ? theme.colors.text : theme.colors.accent;
  const styles: StyleProp<TextStyle> = {
    fontSize,
    lineHeight,
    color: textColor,
  };

  if (weight === "bold") {
    styles.fontWeight = "bold";
  }

  return styles;
};

// eslint-disable-next-line react/prop-types
const MyText: React.FC<Props> = ({ size, color, weight, style, ...props }) => {
  const theme = useCurrentTheme();
  const styles = getTextStyles({ size, color, weight }, theme);
  return <Text style={[styles, style]} {...props} />;
};

export default MyText;