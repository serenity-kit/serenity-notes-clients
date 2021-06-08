import React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { ListItem } from "react-native-elements";
import colors from "../../styles/colors";
import ListItemDivider from "../ui/ListItemDivider";
import { Switch } from "react-native-paper";

type Props = {
  children: React.ReactNode;
  value: boolean;
  onValueChange: () => void;
  topDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function ListItemToggle(props: Props) {
  const { topDivider, ...otherProps } = props;
  return (
    <View>
      {topDivider ? <ListItemDivider /> : null}
      <ListItem underlayColor={colors.underlay} {...otherProps}>
        <ListItem.Content>
          <ListItem.Title style={{ color: colors.text }}>
            {props.children}
          </ListItem.Title>
        </ListItem.Content>
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          color={colors.primary}
        />
      </ListItem>
    </View>
  );
}
