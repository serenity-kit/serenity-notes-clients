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
import { Clipboard, Alert } from "react-native";
import { ListItem, Icon } from "react-native-elements";

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
      <ListWrapper style={{ marginTop: 10 }}>
        <ListItem
          underlayColor={colors.underlay}
          onPress={async () => {
            await Clipboard.setString(JSON.stringify(debugLog));
            Alert.alert("Copied to Clipboard");
          }}
        >
          <Icon name="copy" type="feather" color={colors.primary} />
          <ListItem.Content>
            <ListItem.Title>Copy raw debug log</ListItem.Title>
          </ListItem.Content>
        </ListItem>
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
        keyExtractor={(item) => item.createdAt}
        renderItem={({ item }: { item: DebugEntry }) => {
          return (
            <View style={{ backgroundColor: colors.white, padding: 10 }}>
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
