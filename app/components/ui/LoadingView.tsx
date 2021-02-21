import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  loadingView: {
    backgroundColor: colors.background,
    height: "100%",
    flex: 1,
    justifyContent: "center",
  },
});

type Props = {
  style?: any;
};

const LoadingView = (props: Props) => (
  <View style={[styles.loadingView, props.style]}>
    {/** TODO make it black and fade in after 200ms */}
    <ActivityIndicator color={colors.textBrightest} size="small" />
  </View>
);

export default LoadingView;
