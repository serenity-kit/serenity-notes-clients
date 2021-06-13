import React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { ListItem } from "react-native-elements";
import colors from "../../styles/colors";
import useCurrentTheme from "../../hooks/useCurrentTheme";

import ListItemDivider from "../ui/ListItemDivider";

type Props = {
  children: React.ReactNode;
  onPress: () => void;
  topDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function ListItemLink(props: Props) {
  const theme = useCurrentTheme();

  const color = props.disabled ? theme.colors.accent : theme.colors.text;

  const { topDivider, ...otherProps } = props;
  return (
    <View>
      {topDivider ? <ListItemDivider /> : null}
      <ListItem
        underlayColor={theme.colors.onSurface}
        containerStyle={{
          backgroundColor: theme.colors.background,
        }}
        {...otherProps}
      >
        <ListItem.Content>
          <ListItem.Title style={{ color }}>{props.children}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron color={color} />
      </ListItem>
    </View>
  );
}
