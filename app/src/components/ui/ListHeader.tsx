import React from "react";
import { ListItem } from "react-native-elements";
import colors from "../../styles/colors";

type Props = {
  children: React.ReactNode;
};

export default function ListHeader(props: Props) {
  return (
    <ListItem
      containerStyle={{
        backgroundColor: colors.background,
        paddingTop: 20,
      }}
    >
      <ListItem.Content>
        <ListItem.Title style={{ fontWeight: "500" }}>
          {props.children}
        </ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );
}
