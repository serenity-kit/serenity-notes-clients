import React from "react";
import { ListItem } from "react-native-elements";
import useCurrentTheme from "../../hooks/useCurrentTheme";

type Props = {
  children: React.ReactNode;
};

export default function ListHeader(props: Props) {
  const theme = useCurrentTheme();

  return (
    <ListItem
      containerStyle={{
        backgroundColor: theme.colors.backdrop,
        paddingTop: 20,
      }}
    >
      <ListItem.Content>
        <ListItem.Title style={{ color: theme.colors.text, fontWeight: "500" }}>
          {props.children}
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}
