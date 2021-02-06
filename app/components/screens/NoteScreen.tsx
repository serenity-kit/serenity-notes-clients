import React, { useEffect, useRef, useCallback } from "react";
import { Asset } from "expo-asset";
import { View, StyleSheet, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import deepEqual from "fast-deep-equal/es6";
import { Y } from "../../vendor/index.js";
import * as repositoryStore from "../../utils/repositoryStore";
import KeyboardAvoidContainer from "../ui/KeyboardAvoidContainer";
import Spacer from "../ui/Spacer";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import Text from "../ui/Text";
import LoadingView from "../ui/LoadingView";
import ServerSyncInfo from "../ui/ServerSyncInfo";

let source =
  Platform.OS === "ios" ? require("../../assets/index.html") : { html: null };

async function loadHtmlFileForAndroid() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const indexHtml = Asset.fromModule(require("../../assets/index.html"));
  await indexHtml.downloadAsync();
  const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
  source = { html };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    // changing it to flex: 1 leads to weird behaviour e.g. notes don't render at the top and it somehow flickers
    height: "100%",
  },
  webView: {
    backgroundColor: "#fff",
    flex: 1,
    display: "flex",
  },
});

export default function NoteScreen({ route, navigation }) {
  const { id, isNew } = route.params;
  const yDocRef = useRef(null);
  const contentRef = useRef(null);
  const initializedRef = useRef(false);
  const webViewRef = useRef(null);
  const [, updateState] = React.useState();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const forceUpdate = useCallback(() => updateState({}), []);
  useEffect(() => {
    const initDoc = async (id) => {
      if (Platform.OS !== "ios") {
        await loadHtmlFileForAndroid();
      }
      const newYDoc = new Y.Doc();
      yDocRef.current = newYDoc;
      const repo = await repositoryStore.getRepository(id);
      if (repo) {
        Y.applyUpdate(yDocRef.current, repo.content);
        contentRef.current = repo.content;
        forceUpdate();
      } else {
        forceUpdate();
      }
    };
    initDoc(id);

    const subscriptionId = repositoryStore.subscribeToRepository(
      id,
      (repository) => {
        // avoid update before the webview is even initialized
        if (!initializedRef.current) return;
        // happens in case the repository is removed
        if (!repository) {
          setIsDeleted(true);
          return;
        }
        Y.applyUpdate(yDocRef.current, repository.content);
        webViewRef.current.injectJavaScript(`
          window.applyYjsUpdate(${JSON.stringify(
            Array.apply([], repository.content)
          )});
          true;
        `);
      }
    );

    return () => {
      repositoryStore.unsubscribeToRepository(subscriptionId);
    };
  }, []);

  if (isDeleted) {
    return (
      <ScrollScreenContainer horizontalPadding>
        <Spacer />
        <Text>This note just has been deleted.</Text>
      </ScrollScreenContainer>
    );
  }

  if (yDocRef.current === null) {
    return (
      <View style={styles.container}>
        <Spacer />
        <LoadingView />
      </View>
    );
  }

  return (
    <KeyboardAvoidContainer>
      <ServerSyncInfo />
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        startInLoadingState={true}
        // can be activated once there is `Done` button
        // hideKeyboardAccessoryView={true}
        // to avoid weird scrolling behaviour when the keyboard becomes active
        scrollEnabled={false}
        renderLoading={() => (
          <View style={styles.container}>
            <Spacer />
            <LoadingView />
          </View>
        )}
        onMessage={async (event) => {
          // event.persist();
          const update = new Uint8Array(JSON.parse(event.nativeEvent.data));
          Y.applyUpdate(yDocRef.current, update);
          const serializedYDoc = Y.encodeStateAsUpdate(yDocRef.current);

          // optimization: prevent update in case the content hasn't changed
          if (deepEqual(serializedYDoc, contentRef.current)) return;

          const repo = await repositoryStore.getRepository(id);
          await repositoryStore.setRepository({
            ...repo,
            content: serializedYDoc,
            updatedAt: new Date().toISOString(),
          });
        }}
        style={styles.webView}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        onLoad={() => {
          if (isNew) {
            webViewRef.current.injectJavaScript(`
              document.querySelector(".ProseMirror").focus();
              true;
            `);
            initializedRef.current = true;
          } else {
            webViewRef.current.injectJavaScript(`
              window.applyYjsUpdate(${JSON.stringify(
                Array.apply([], contentRef.current)
              )});
              true;
            `);
            initializedRef.current = true;
          }
        }}
      />
    </KeyboardAvoidContainer>
  );
}
