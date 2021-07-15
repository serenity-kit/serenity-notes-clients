import React, { useEffect, useRef, useCallback, useState } from "react";
import { View, StyleSheet, Platform, Linking, Alert } from "react-native";
import { IconButton, TouchableRipple } from "react-native-paper";
import { WebView } from "react-native-webview";
import deepEqual from "fast-deep-equal/es6";
import { Y } from "../../vendor/index.js";
import * as repositoryStore from "../../utils/repositoryStore";
import KeyboardAvoidContainer from "../ui/KeyboardAvoidContainer";
import Spacer from "../ui/Spacer";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import Text from "../ui/Text";
import LoadingView from "../ui/LoadingView";
import UploadArrow from "../ui/UploadArrow";
import DownloadArrow from "../ui/DownloadArrow";
import ServerSyncInfo from "../ui/ServerSyncInfo";
import { Repository } from "../../types";
import colors from "../../styles/colors";
import * as mutationQueue from "../../hooks/useSyncUtils/mutationQueue";
import { loadEditorSourceForAndroid } from "../../utils/editorSource/editorSource";
import { useEditorSource } from "../../context/EditorSourceContext";
import SchemaVerionUpdateHint from "../ui/SchemaVersionUpdateHint";
import getValidUrl from "../../utils/getValidUrl/getValidUrl";

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
  headerRight: {
    display: "flex",
    flexDirection: "row",
  },
  syncInfo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

type HeaderRightProps = {
  navigation: any;
  repository: Repository;
};

const HeaderRight = ({ navigation, repository }: HeaderRightProps) => {
  const [uploadSyncState, setUploadSyncState] =
    useState<mutationQueue.RepositorySyncState>({
      state: "unknown",
    });

  useEffect(() => {
    setUploadSyncState(mutationQueue.getRepositorySyncState(repository.id));
    const subscriptionId = mutationQueue.subscribeToRepository(
      repository.id,
      (syncState) => {
        setUploadSyncState(syncState);
      }
    );
    return () => {
      mutationQueue.unsubscribeToRepository(subscriptionId);
    };
  }, []);

  let failedDownload = true;
  if (repository?.updates) {
    failedDownload = repository.updates.some(
      (update) => update.type === "failed"
    );
  }
  return (
    <View style={styles.headerRight}>
      <TouchableRipple
        borderless
        centered
        onPress={() => {
          navigation.navigate("NoteSettings", {
            id: repository.id,
          });
        }}
        rippleColor={"rgba(68, 85, 207, 0.32)"}
        style={{
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          margin: 6,
          marginRight: 0,
          width: 36,
          height: 36,
          borderRadius: 36 / 2,
        }}
        accessibilityRole="button"
        hitSlop={
          TouchableRipple.supported
            ? { top: 10, left: 10, bottom: 10, right: 10 }
            : { top: 6, left: 6, bottom: 6, right: 6 }
        }
      >
        <View style={styles.syncInfo}>
          <UploadArrow
            animationActive={
              uploadSyncState.state === "in-progress" ||
              uploadSyncState.state === "retry-in-progress"
            }
            color={
              uploadSyncState.state === "unknown"
                ? "#aaa"
                : uploadSyncState.state === "retry-in-progress"
                ? colors.error
                : colors.success
            }
          />
          <DownloadArrow
            // TODO show when a update decryption is in progress
            animationActive={false}
            color={failedDownload ? colors.error : colors.success}
            style={{
              marginLeft: 2,
            }}
          />
        </View>
      </TouchableRipple>

      <IconButton
        icon="account-multiple"
        color={colors.primary}
        onPress={() => {
          navigation.navigate("NoteSettings", {
            id: repository.id,
          });
        }}
        style={{
          marginRight: -4,
        }}
      />
      <IconButton
        icon="dots-horizontal-circle-outline"
        color={colors.primary}
        onPress={() => {
          navigation.navigate("NoteSettings", {
            id: repository.id,
          });
        }}
      />
    </View>
  );
};

let androidEditorSource = { html: null };

export default function NoteScreen({ route, navigation }) {
  const { id, isNew } = route.params;
  const yDocRef = useRef(null);
  const contentRef = useRef(null);
  const initializedRef = useRef(false);
  const webViewRef = useRef(null);
  const [, updateState] = React.useState();
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [
    notAppliedUpdatesIncludeNewerSchemaVersion,
    setNotAppliedUpdatesIncludeNewerSchemaVersion,
  ] = React.useState(false);
  const forceUpdate = useCallback(() => updateState({}), []);
  const editorSource = useEditorSource();

  useEffect(() => {
    const initDoc = async (id) => {
      if (Platform.OS === "android") {
        androidEditorSource = await loadEditorSourceForAndroid();
      }
      const newYDoc = new Y.Doc();
      yDocRef.current = newYDoc;
      const repo = await repositoryStore.getRepository(id);
      if (repo) {
        if (repo.notAppliedUpdatesIncludeNewerSchemaVersion) {
          setNotAppliedUpdatesIncludeNewerSchemaVersion(true);
        } else {
          setNotAppliedUpdatesIncludeNewerSchemaVersion(false);
        }

        Y.applyUpdate(yDocRef.current, repo.content);
        contentRef.current = repo.content;
        forceUpdate();
        navigation.setOptions({
          headerRight: () => (
            <HeaderRight navigation={navigation} repository={repo} />
          ),
        });
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
        navigation.setOptions({
          headerRight: () => (
            <HeaderRight navigation={navigation} repository={repository} />
          ),
        });
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
        <LoadingView style={{ backgroundColor: colors.white }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidContainer>
      <ServerSyncInfo />
      {notAppliedUpdatesIncludeNewerSchemaVersion ? (
        <SchemaVerionUpdateHint />
      ) : null}
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={Platform.OS === "android" ? androidEditorSource : editorSource}
        startInLoadingState={true}
        // can be activated once there is `Done` button
        // hideKeyboardAccessoryView={true}
        // to avoid weird scrolling behaviour when the keyboard becomes active
        scrollEnabled={Platform.OS === "macos" ? true : false}
        renderLoading={() => (
          <View style={styles.container}>
            <Spacer />
            <LoadingView style={{ backgroundColor: colors.white }} />
          </View>
        )}
        onMessage={async (event) => {
          // event.persist();
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === "update") {
            const update = new Uint8Array(message.content);
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
          }
          if (message.type === "openLink") {
            if (Linking.canOpenURL(message.link)) {
              try {
                await Linking.openURL(message.link);
              } catch (err) {
                Alert.alert("Can't open URL", message.link);
              }
            } else {
              Alert.alert("Can't open URL", message.link);
            }
          }
        }}
        style={styles.webView}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        onLoad={() => {
          // debug for the editor
          // console.log(JSON.stringify(Array.apply([], contentRef.current)));
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
