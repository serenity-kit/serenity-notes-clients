import React from "react";
import { StyleSheet, View, FlatList, Text as RawText } from "react-native";
import colors from "../../styles/colors";
import ListWrapper from "../ui/ListWrapper";
import ListItemToggle from "../ui/ListItemToggle";
import Text from "../ui/Text";
import { DebugEntry } from "../../types";
import {
  getDebugLogActive,
  setDebugLogActive,
  getDebugLog,
} from "../../stores/debugStore";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
});

export default function DebugScreen() {
  const [debugLog, setDebugLog] = React.useState<DebugEntry[]>([]);
  const [debugLogActive, setDebugLogActiveLocal] = React.useState(() =>
    getDebugLogActive()
  );

  React.useEffect(() => {
    const fetchDebugLog = async () => {
      const log = await getDebugLog();
      setDebugLog(log.reverse());
    };

    fetchDebugLog();
  }, []);

  return (
    <View style={styles.container}>
      <ListWrapper>
        <ListItemToggle
          value={debugLogActive}
          onValueChange={() => {
            setDebugLogActiveLocal((currentLogDebug) => {
              setDebugLogActive(!currentLogDebug);
              return !currentLogDebug;
            });
          }}
        >
          Log Debug Info
        </ListItemToggle>
      </ListWrapper>
      <FlatList
        style={{
          backgroundColor: colors.background,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 10,
          borderRadius: 6,
        }}
        data={debugLog}
        renderItem={({ item }: { item: DebugEntry }) => {
          return (
            <View
              key={item.createdAt}
              style={{ backgroundColor: colors.white, padding: 10 }}
            >
              <Text size="s">
                {}
                {item.createdAt}
                {item.type === "error" ? (
                  <RawText style={{ color: colors.error }}> (Error)</RawText>
                ) : null}
              </Text>

              <Text>{item.content}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
