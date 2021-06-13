import React from "react";
import {
  TextInput as NativeTextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import useCurrentTheme from "../../hooks/useCurrentTheme";

const styles = StyleSheet.create({
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    lineHeight: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

type Props = TextInputProps & {
  minHeight?: number;
  disabled?: boolean;
};

const TextInput = (props: Props) => {
  const theme = useCurrentTheme();
  const style = {
    minHeight: props.minHeight ? props.minHeight : 0,
    color: props.disabled ? theme.colors.accent : theme.colors.text,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.accent,
  };
  return (
    <NativeTextInput
      selectionColor={theme.colors.primary}
      placeholderTextColor={
        props.disabled ? theme.colors.accent : theme.colors.placeholder
      }
      style={[styles.textInput, style]}
      multiline
      editable={!props.disabled}
      {...props}
    />
  );
};

export default TextInput;
