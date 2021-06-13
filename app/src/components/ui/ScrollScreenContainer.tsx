import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import KeyboardAvoidContainer from "./KeyboardAvoidContainer";
import useCurrentTheme from "../../hooks/useCurrentTheme";

type Props = {
  horizontalPadding?: boolean;
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  scrollViewNoPadding: {},
  scrollViewContainer: {
    paddingBottom: 20,
  },
});

const ScrollScreenContainer: React.FC<Props> = ({
  horizontalPadding = false,
  children,
}) => {
  const theme = useCurrentTheme();
  return (
    <KeyboardAvoidContainer>
      <View
        style={[styles.container, { backgroundColor: theme.colors.backdrop }]}
      >
        <ScrollView
          style={
            horizontalPadding ? styles.scrollView : styles.scrollViewNoPadding
          }
          contentContainerStyle={styles.scrollViewContainer}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidContainer>
  );
};

export default ScrollScreenContainer;
