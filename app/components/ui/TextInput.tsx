import React from "react";
import {
  TextInput as NativeTextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.white,
    lineHeight: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
});

type Props = TextInputProps & {
  minHeight?: number;
  disabled?: boolean;
};

const TextInput = (props: Props) => {
  const style = {
    minHeight: props.minHeight ? props.minHeight : 0,
    color: props.disabled ? colors.textBrightest : colors.text,
  };
  return (
    <NativeTextInput
      selectionColor={colors.primary}
      placeholderTextColor={
        props.disabled ? colors.divider : colors.textBrightest
      }
      style={[styles.textInput, style]}
      multiline
      editable={!props.disabled}
      {...props}
    />
  );
};

export default TextInput;
