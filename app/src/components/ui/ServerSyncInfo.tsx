import React from "react";
import { Text, StyleSheet, View } from "react-native";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { sizes } from "../../styles/fonts";
import { useSyncInfo } from "../../context/SyncInfoContext";
import LoadingEllipsis from "./LoadingEllipsis";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  hint: {
    color: "#4e614e",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#eefdee",
    padding: sizes.medium * 0.8,
  },
  hintWrapper: {
    borderColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
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

const ServerSyncInfo: React.FC = () => {
  const { loadRepositoriesSyncState } = useSyncInfo();
  const [time, setTime] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loadRepositoriesSyncState.type === "inprogress") return null;

  if (loadRepositoriesSyncState.type === "success") {
    const secondsToLastSuccessfulSync = Math.round(
      (time - loadRepositoriesSyncState.datetime.getTime()) / 1000
    );
    if (secondsToLastSuccessfulSync > 30) {
      const timeDiff =
        secondsToLastSuccessfulSync < 60
          ? `${secondsToLastSuccessfulSync} seconds ago`
          : formatDistanceToNow(loadRepositoriesSyncState.datetime, {
              addSuffix: true,
              includeSeconds: true,
            });
      return (
        <View style={styles.hintWrapper}>
          <Text style={styles.hint}>
            Last server sync was {timeDiff}. Syncing now <LoadingEllipsis />
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }
  if (!loadRepositoriesSyncState.lastSuccessDatetime) {
    return (
      <View style={styles.warningHintWrapper}>
        <Text style={styles.warningHint}>
          Failed to sync with the server. Trying again <LoadingEllipsis />
        </Text>
      </View>
    );
  }

  const secondsToLastSuccessfulSync = Math.round(
    (time - loadRepositoriesSyncState.lastSuccessDatetime.getTime()) / 1000
  );

  if (secondsToLastSuccessfulSync > 15) {
    const timeDiff =
      secondsToLastSuccessfulSync < 60
        ? `${secondsToLastSuccessfulSync} seconds ago`
        : formatDistanceToNow(loadRepositoriesSyncState.lastSuccessDatetime, {
            includeSeconds: true,
          });
    return (
      <View style={styles.warningHintWrapper}>
        <Text style={styles.warningHint}>
          Failed to sync with the server since {timeDiff}. Trying again{" "}
          <LoadingEllipsis />
        </Text>
      </View>
    );
  }

  return null;
};

export default ServerSyncInfo;
