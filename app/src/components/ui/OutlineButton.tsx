import React from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import useCurrentTheme from "../../hooks/useCurrentTheme";

type ButtonProps = {
  iconType?: "plus" | "minus" | "share" | "verify";
  align?: "left" | "center";
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
};

export default function MyButton(props: ButtonProps) {
  const style = props.style ? props.style : {};
  const theme = useCurrentTheme();
  let icon = undefined;
  let labelColor = props.secondary ? theme.colors.accent : theme.colors.primary;
  if (props.iconType === "plus") {
    icon = ({ color }: { color: string; size: any }) => {
      return (
        <Icon
          name="plus-circle"
          type="feather"
          color={color}
          iconStyle={{
            opacity: props.disabled ? 0.6 : 1,
          }}
        />
      );
    };
  }
  if (props.iconType === "minus") {
    icon = ({ color }: { color: string; size: any }) => {
      return (
        <Icon
          name="minus-circle"
          type="feather"
          color={color}
          iconStyle={{
            opacity: props.disabled ? 0.6 : 1,
          }}
        />
      );
    };
    labelColor = theme.colors.error;
  }
  if (props.iconType === "share") {
    icon = ({ color }: { color: string; size: any }) => {
      return (
        <Icon
          name="share"
          type="feather"
          color={color}
          iconStyle={{
            opacity: props.disabled ? 0.6 : 1,
          }}
        />
      );
    };
  }

  if (props.iconType === "verify") {
    icon = ({ color }: { color: string; size: any }) => {
      return (
        <Icon
          name="check-circle"
          type="feather"
          color={color}
          iconStyle={{
            opacity: props.disabled ? 0.6 : 1,
          }}
        />
      );
    };
  }

  return (
    <Button
      {...props}
      uppercase={false}
      mode="outlined"
      icon={icon}
      labelStyle={{
        fontSize: 16,
        color: labelColor,
        opacity: props.disabled ? 0.6 : 1,
      }}
      contentStyle={{
        height: 50,
        backgroundColor: theme.colors.backdrop,
        justifyContent: props.align === "center" ? "center" : "flex-start",
      }}
      style={{
        backgroundColor: theme.colors.backdrop,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 6,
        borderColor: theme.colors.accent,
        borderWidth: StyleSheet.hairlineWidth,
        ...style,
      }}
    />
  );
}
