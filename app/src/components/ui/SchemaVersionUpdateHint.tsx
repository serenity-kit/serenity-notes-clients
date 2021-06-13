import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { sizes } from "../../styles/fonts";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  warningHint: {
    color: "#503b00",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#fff6dd",
    padding: sizes.medium * 0.8,
  },
  warningHintWrapper: {
    borderColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

const SchemaVerionUpdateHint: React.FC = () => {
  return (
    <View style={styles.warningHintWrapper}>
      <Text style={styles.warningHint}>
        Please update your application. Changes from other devices couldn{"'"}t
        be applied, since they were created with a newer editor.
      </Text>
    </View>
  );
};

export default SchemaVerionUpdateHint;
