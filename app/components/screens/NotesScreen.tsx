import React from "react";
import { StyleSheet, View, FlatList, Text, Alert } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import { v4 as uuidv4 } from "uuid";
import * as Random from "expo-random";
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
import colors from "../../styles/colors";
import Spacer from "../ui/Spacer";

const getuuid = async () =>
  uuidv4({ random: await Random.getRandomBytesAsync(16) });

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
    borderBottomColor: "#bbb",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default function Notes({ navigation }) {
  const repositoriesState = useRepositories();
  const privateInfoResult = usePrivateInfo();
  const hasActiveLicenseResult = useHasActiveLicense();
  const userResult = useUser();

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

      <ListItem
        topDivider
        bottomDivider
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

          const id = await getuuid();
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
        <Icon name="plus-circle" type="feather" />
        <ListItem.Content>
          <ListItem.Title>Add Note</ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <Spacer />

      {notesList.length === 0 ? (
        <EmptyList iconName="edit">
          <Text style={{ fontSize: 18 }}>Empty in Notes</Text>
        </EmptyList>
      ) : (
        <>
          <ListItem
            bottomDivider
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
            }}
            data={notesList}
            renderItem={({ item }: { item: RepositoryStoreEntry }) => {
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

              return (
                <ListItem
                  key={item.id}
                  bottomDivider
                  onPress={() => {
                    navigation.navigate("Note", { id: item.id, isNew: false });
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
                  <ListItem.Subtitle style={{ fontSize: 12, color: "#8A8B96" }}>
                    {item.updatedAt
                      ? formatDistanceToNow(new Date(item.updatedAt))
                      : "-"}
                  </ListItem.Subtitle>
                  <ListItem.Chevron />
                </ListItem>
              );
            }}
          />
        </>
      )}
    </View>
  );
}
