import React from "react";
import { Text, StyleSheet } from "react-native";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { sizes } from "../../styles/fonts";
import { useSyncInfo } from "../../context/SyncInfoContext";
import LoadingEllipsis from "./LoadingEllipsis";

const styles = StyleSheet.create({
  hint: {
    color: "#4e614e",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#eefdee",

    padding: sizes.medium * 0.8,
  },
  warningHint: {
    color: "#503b00",
    fontSize: sizes.medium,
    lineHeight: sizes.medium * 1.4,
    backgroundColor: "#fff6dd",
    padding: sizes.medium * 0.8,
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
        <Text style={styles.hint}>
          Last server sync was {timeDiff}. Syncing now <LoadingEllipsis />
        </Text>
      );
    } else {
      return null;
    }
  }
  if (!loadRepositoriesSyncState.lastSuccessDatetime) {
    return (
      <Text style={styles.warningHint}>
        Failed to sync with the server. Trying again <LoadingEllipsis />
      </Text>
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
      <Text style={styles.warningHint}>
        Failed to sync with the server since {timeDiff}. Trying again{" "}
        <LoadingEllipsis />
      </Text>
    );
  }

  return null;
};

export default ServerSyncInfo;
