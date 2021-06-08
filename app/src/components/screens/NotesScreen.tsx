import React from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import { ListItem } from "react-native-elements";
import { v4 as uuidv4 } from "uuid";
import formatDistanceToNow from "../../utils/formatDistanceToNow";
import { Y } from "../../vendor/index.js";
import * as repositoryStore from "../../utils/repositoryStore";
import { RepositoryStoreEntry } from "../../types";
import useRepositories from "../../hooks/useRepositories";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useUser from "../../hooks/useUser";
import EmptyList from "../ui/EmptyList";
import ServerSyncInfo from "../ui/ServerSyncInfo";
import useHasActiveLicense from "../../hooks/useHasActiveLicense";
import useRepositoriesWithMutationRetries from "../../hooks/useRepositoriesWithMutationRetries";
import colors from "../../styles/colors";
import Spacer from "../ui/Spacer";
import OutlineButton from "../ui/OutlineButton";
import ListItemDivider from "../ui/ListItemDivider";
import DownloadArrow from "../ui/DownloadArrow";
import UploadArrow from "../ui/UploadArrow";
import Text from "../ui/Text";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
  note: {
    padding: 10,
    fontSize: 16,
    height: 44,
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default function Notes({ navigation }) {
  const repositoriesState = useRepositories(navigation);
  const privateInfoResult = usePrivateInfo();
  const hasActiveLicenseResult = useHasActiveLicense();
  const userResult = useUser();
  const repositoriesWithMutationRetries = useRepositoriesWithMutationRetries(
    navigation
  );

  if (
    repositoriesState.type === "loading" ||
    privateInfoResult.type === "loading" ||
    userResult.type === "loading" ||
    hasActiveLicenseResult.type === "loading"
  ) {
    return null;
  }

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");
  const notesList =
    repositoriesState.type === "repositories"
      ? repositoriesState.repositoryList
          .slice()
          .sort((repositoryA, repositoryB) => {
            return (
              // @ts-ignore
              new Date(
                repositoryB.updatedAt
                  ? repositoryB.updatedAt
                  : repositoryB.lastUpdatedAt
              ) -
              // @ts-ignore
              new Date(
                repositoryA.updatedAt
                  ? repositoryA.updatedAt
                  : repositoryA.lastUpdatedAt
              )
            );
          })
      : [];

  return (
    <View style={styles.container}>
      <ServerSyncInfo />

      <OutlineButton
        align="center"
        iconType="plus"
        onPress={async () => {
          const maxNotes = 3;
          if (
            !hasActiveLicenseResult.hasActiveLicense &&
            notesList.length >= maxNotes
          ) {
            // Alert.alert(
            //   "You are on a free account.",
            //   `To create more than ${maxNotes} notes please upgrade your account.`
            // );
            Alert.alert(
              "Sorry",
              `You account supports max. ${maxNotes} notes.`
            );
            return;
          }

          const id = await uuidv4();
          const doc = new Y.Doc();
          const serializedYDoc = Y.encodeStateAsUpdate(doc);

          await repositoryStore.setRepository({
            id,
            content: serializedYDoc,
            format: "yjs-13-base64",
            isCreator: true,
            updatedAt: new Date().toISOString(),
          });
          navigation.navigate("Note", { id, isNew: true });
        }}
      >
        Add Note
      </OutlineButton>
      <Spacer />

      {notesList.length === 0 ? (
        <EmptyList iconName="edit">
          <Text>Empty in Notes</Text>
        </EmptyList>
      ) : (
        <>
          <ListItem
            containerStyle={{
              backgroundColor: colors.background,
              paddingTop: 20,
            }}
          >
            <ListItem.Content>
              <ListItem.Title style={{ fontWeight: "500" }}>
                Notes
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Subtitle style={{ fontSize: 12 }}>
              Sorted by last update
            </ListItem.Subtitle>
          </ListItem>
          <FlatList
            style={{
              backgroundColor: colors.background,
              marginLeft: 10,
              marginRight: 10,
            }}
            data={notesList}
            renderItem={({
              item,
              index,
            }: {
              item: RepositoryStoreEntry;
              index: number;
            }) => {
              let names = [];
              if (userResult.type === "user" && item.collaborators) {
                names = item.collaborators
                  .filter(
                    (collaborator) => collaborator.id !== userResult.user.id
                  )
                  .map((collaborator) => {
                    const yContact = yContacts.get(collaborator.id);
                    const name = yContact ? yContact.get("name") : "Unkown";
                    return name;
                  });
              }

              let failedToDecryptContent = true;
              if (item?.updates) {
                failedToDecryptContent = item.updates.some(
                  (update) => update.type === "failed"
                );
              }
              const failedUpload = repositoriesWithMutationRetries.includes(
                item.id
              );

              return (
                <React.Fragment key={item.id}>
                  {index === 0 ? null : <ListItemDivider />}
                  <ListItem
                    underlayColor={colors.underlay}
                    onPress={() => {
                      navigation.navigate("Note", {
                        id: item.id,
                        isNew: false,
                      });
                    }}
                    style={{
                      borderTopLeftRadius: index === 0 ? 6 : 0,
                      borderTopRightRadius: index === 0 ? 6 : 0,
                      borderBottomLeftRadius:
                        index === notesList.length - 1 ? 6 : 0,
                      borderBottomRightRadius:
                        index === notesList.length - 1 ? 6 : 0,
                    }}
                    containerStyle={{
                      borderColor: colors.divider,
                      borderLeftWidth: StyleSheet.hairlineWidth,
                      borderRightWidth: StyleSheet.hairlineWidth,
                      borderTopLeftRadius: index === 0 ? 6 : 0,
                      borderTopRightRadius: index === 0 ? 6 : 0,
                      borderTopWidth:
                        index === 0 ? StyleSheet.hairlineWidth : 0,
                      borderBottomLeftRadius:
                        index === notesList.length - 1 ? 6 : 0,
                      borderBottomRightRadius:
                        index === notesList.length - 1 ? 6 : 0,
                      borderBottomWidth:
                        index === notesList.length - 1
                          ? StyleSheet.hairlineWidth
                          : 0,
                    }}
                  >
                    <ListItem.Content>
                      <ListItem.Title numberOfLines={1}>
                        {item.name}
                      </ListItem.Title>

                      <ListItem.Subtitle
                        numberOfLines={1}
                        style={{ fontSize: 12, color: "#8A8B96" }}
                      >
                        {names.length > 0
                          ? `Shared with ${names.join(", ")}`
                          : "Private"}
                      </ListItem.Subtitle>
                    </ListItem.Content>

                    {failedUpload && failedToDecryptContent ? (
                      <>
                        <UploadArrow
                          animationActive={false}
                          color={colors.error}
                          style={{
                            transform: [{ scale: 0.8 }],
                          }}
                        />
                        <DownloadArrow
                          animationActive={false}
                          color={colors.error}
                          style={{
                            transform: [{ scale: 0.8 }],
                          }}
                        />
                      </>
                    ) : null}
                    {failedUpload && !failedToDecryptContent ? (
                      <UploadArrow
                        animationActive={false}
                        color={colors.error}
                        style={{
                          transform: [{ scale: 0.8 }],
                        }}
                      />
                    ) : null}
                    {!failedUpload && failedToDecryptContent ? (
                      <DownloadArrow
                        animationActive={false}
                        color={colors.error}
                        style={{
                          transform: [{ scale: 0.8 }],
                        }}
                      />
                    ) : null}
                    <ListItem.Subtitle
                      style={{ fontSize: 12, color: "#8A8B96" }}
                    >
                      {item.updatedAt
                        ? formatDistanceToNow(new Date(item.updatedAt))
                        : "-"}
                    </ListItem.Subtitle>

                    <ListItem.Chevron color={colors.primary} />
                  </ListItem>
                </React.Fragment>
              );
            }}
          />
        </>
      )}
    </View>
  );
}
