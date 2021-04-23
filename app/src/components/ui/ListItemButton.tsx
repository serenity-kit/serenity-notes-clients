import React from "react";
import { StyleSheet } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import colors from "../../styles/colors";

type Props = {
  children: string;
  onPress: () => void;
  style?: any;
};

export default function ListItemButton(props: Props) {
  const style = props.style || {};
  return (
    <ListItem
      underlayColor={colors.underlay}
      {...props}
      style={{
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 6,
        ...style,
      }}
      containerStyle={{
        borderRadius: 6,
        borderColor: colors.divider,
        borderWidth: StyleSheet.hairlineWidth,
      }}
    >
      <Icon
        name="plus-circle"
        type="feather"
        color={colors.primary}
        //   color={userResult.type === "user" ? "#000" : "#aaa"}
      />
      <ListItem.Content>
        <ListItem.Title
          style={{
            color: colors.primary,
          }}
        >
          {props.children}
        </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron color={colors.primary} />
    </ListItem>
  );
}
