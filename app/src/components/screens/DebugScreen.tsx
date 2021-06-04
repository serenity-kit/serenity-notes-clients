import React from "react";
import { StyleSheet, View, FlatList, Text as RawText } from "react-native";
import colors from "../../styles/colors";
import ListItemInfo from "../ui/ListItemInfo";
import ListWrapper from "../ui/ListWrapper";
import Text from "../ui/Text";
import apiUrl from "../../utils/apiUrl/apiUrl";
import { DebugEntry } from "../../types";
import { getDebugLog } from "../../stores/debugStore";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
});

export default function DebugScreen() {
  const [debugLog, setDebugLog] = React.useState<DebugEntry[]>([]);

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
        <ListItemInfo label="API Url">{apiUrl}</ListItemInfo>
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
