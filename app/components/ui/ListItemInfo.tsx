import React from "react";
import { Clipboard, Alert } from "react-native";
import { ListItem, Icon } from "react-native-elements";

type Props = {
  children: string;
  label: React.ReactNode;
};

export default function ListItemInfo(props: Props) {
  return (
    <ListItem
      bottomDivider
      onPress={async () => {
        await Clipboard.setString(props.children);
        Alert.alert("Copied to Clipboard");
      }}
    >
      <Icon name="copy" type="feather" />
      <ListItem.Content>
        <ListItem.Subtitle style={{ fontSize: 12, color: "#8A8B96" }}>
          {props.label}
        </ListItem.Subtitle>
        <ListItem.Title>{props.children}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}
