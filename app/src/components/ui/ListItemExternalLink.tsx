import React from "react";
import { StyleSheet } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import colors from "../../styles/colors";

type Props = {
  children: string;
  onPress: () => void;
  style?: any;
};

export default function ListItemExternalLink(props: Props) {
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
      <Icon name="external-link" type="feather" color={colors.primary} />
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
