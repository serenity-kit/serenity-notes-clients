import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import Text from "../ui/Text";
import Spacer from "../ui/Spacer";
import OutlineButton from "../ui/OutlineButton";
import { reloadApp } from "../../utils/reloadApp";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },

  content: {
    alignItems: "center",
  },
});

export default function GoodbyeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text weight="bold">Goodbye 👋</Text>
        <Spacer size="s" />
        {Platform.OS === "android" || Platform.OS === "ios" ? (
          <OutlineButton
            align="center"
            onPress={async () => {
              await reloadApp();
            }}
          >
            Reload App
          </OutlineButton>
        ) : (
          <Text size="s">
            Close & restart the app to go back to the welcome screen.
          </Text>
        )}
      </View>
    </View>
  );
}
