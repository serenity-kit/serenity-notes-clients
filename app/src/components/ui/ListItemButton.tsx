import React from "react";
import { StyleSheet } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import useCurrentTheme from "../../hooks/useCurrentTheme";

type Props = {
  children: string;
  onPress: () => void;
  style?: any;
};

export default function ListItemButton(props: Props) {
  const theme = useCurrentTheme();
  const style = props.style || {};
  return (
    <ListItem
      underlayColor={theme.colors.onSurface}
      {...props}
      style={{
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 6,
        ...style,
      }}
      containerStyle={{
        borderRadius: 6,
        borderColor: theme.colors.accent,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.background,
      }}
    >
      <Icon
        name="plus-circle"
        type="feather"
        color={theme.colors.primary}
        //   color={userResult.type === "user" ? "#000" : "#aaa"}
      />
      <ListItem.Content>
        <ListItem.Title
          style={{
            color: theme.colors.primary,
          }}
        >
          {props.children}
        </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron color={theme.colors.primary} />
    </ListItem>
  );
}
