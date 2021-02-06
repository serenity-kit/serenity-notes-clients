import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const styles = StyleSheet.create({
  loadingView: {
    backgroundColor: "#fff",
    height: "100%",
    flex: 1,
    justifyContent: "center",
  },
});

const LoadingView: React.FC = () => (
  <View style={styles.loadingView}>
    {/** TODO make it black and fade in after 200ms */}
    <ActivityIndicator color="#ddd" size="small" />
  </View>
);

export default LoadingView;
