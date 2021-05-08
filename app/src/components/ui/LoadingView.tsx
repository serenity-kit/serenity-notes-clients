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

const LoadingView = (props: Props) => {
  const [showLoadingIndicator, setShowLoadingIndicator] = React.useState(false);
  React.useEffect(() => {
    const timeout = setTimeout(() => setShowLoadingIndicator(true), 450);
    return () => clearTimeout(timeout);
  });
  return (
    <View style={[styles.loadingView, props.style]}>
      {showLoadingIndicator ? (
        <ActivityIndicator color={colors.textBrightest} />
      ) : null}
    </View>
  );
};

export default LoadingView;
