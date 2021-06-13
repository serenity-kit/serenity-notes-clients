import React from "react";
import { Clipboard, Alert } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import colors from "../../styles/colors";
import ListItemDivider from "../ui/ListItemDivider";
import useCurrentTheme from "../../hooks/useCurrentTheme";

type Props = {
  children: string;
  label: React.ReactNode;
  topDivider?: boolean;
};

export default function ListItemInfo(props: Props) {
  const theme = useCurrentTheme();
  return (
    <>
      {props.topDivider ? <ListItemDivider /> : null}
      <ListItem
        underlayColor={theme.colors.onSurface}
        containerStyle={{ backgroundColor: theme.colors.background }}
        onPress={async () => {
          await Clipboard.setString(props.children);
          Alert.alert("Copied to Clipboard");
        }}
      >
        <Icon name="copy" type="feather" color={theme.colors.primary} />
        <ListItem.Content>
          <ListItem.Subtitle style={{ fontSize: 12, color: "#8A8B96" }}>
            {props.label}
          </ListItem.Subtitle>
          <ListItem.Title style={{ color: theme.colors.text }}>
            {props.children}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </>
  );
}
