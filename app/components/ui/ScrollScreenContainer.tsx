import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import KeyboardAvoidContainer from "./KeyboardAvoidContainer";
import colors from "../../styles/colors";

type Props = {
  horizontalPadding?: boolean;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
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
  return (
    <KeyboardAvoidContainer>
      <View style={styles.container}>
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
