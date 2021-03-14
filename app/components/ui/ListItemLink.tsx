import React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { ListItem } from "react-native-elements";
import colors from "../../styles/colors";
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
  const { topDivider, ...otherProps } = props;
  return (
    <View>
      {topDivider ? <ListItemDivider /> : null}
      <ListItem underlayColor={colors.underlay} {...otherProps}>
        <ListItem.Content>
          <ListItem.Title
            style={{ color: props.disabled ? colors.divider : colors.text }}
          >
            {props.children}
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron
          color={props.disabled ? colors.divider : colors.primary}
        />
      </ListItem>
    </View>
  );
}
