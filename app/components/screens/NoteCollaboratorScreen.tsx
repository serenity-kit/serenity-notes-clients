import React from "react";
import { ListItem, Icon } from "react-native-elements";
import { useClient } from "urql";
import Spacer from "../ui/Spacer";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import useRepository from "../../hooks/useRepository";
import useUser from "../../hooks/useUser";
import useDevice from "../../hooks/useDevice";
import removeCollaboratorFromRepository from "../../utils/server/removeCollaboratorFromRepository";
import { Alert } from "react-native";
import Text from "../ui/Text";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import ServerSyncInfo from "../ui/ServerSyncInfo";

export default function NoteSettingsScreen({ navigation, route }) {
  const repositoryResult = useRepository(route.params.repositoryId);
  const userResult = useUser();
  const deviceResult = useDevice();
  const client = useClient();
  const privateInfoResult = usePrivateInfo();

  if (repositoryResult.type === "notFound") {
    return (
      <ScrollScreenContainer horizontalPadding>
        <Spacer />
        <Text>This note just has been deleted.</Text>
      </ScrollScreenContainer>
    );
  }

  // TODO add error hint after a bit of time
  if (
    repositoryResult.type !== "repository" ||
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return <ScrollScreenContainer />;

  const isRepositoryCreator =
    userResult.type === "user" &&
    repositoryResult.type === "repository" &&
    repositoryResult.repository.isCreator;

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");
  const yContact = yContacts.get(route.params.collaboratorId);
  const name = yContact ? yContact.get("name") : "Unknown";

  return (
    <ScrollScreenContainer>
      <ServerSyncInfo />

      <Spacer />
      <ListHeader>Info</ListHeader>
      <ListItemInfo label={`Name`}>{name}</ListItemInfo>

      <Spacer />
      <ListHeader>Actions</ListHeader>
      <ListItem
        bottomDivider
        onPress={async () => {
          if (!repositoryResult.repository.serverId) {
            Alert.alert("Note first must be sucessfully synced to the server.");
            return;
          }
          if (!isRepositoryCreator) {
            Alert.alert(
              "Currently only the note creator can't remove collaborators."
            );
            return;
          }
          try {
            await removeCollaboratorFromRepository(
              client,
              repositoryResult.repository.serverId,
              route.params.collaboratorId,
              deviceResult.device
            );
          } catch (err) {
            Alert.alert(
              "Failed",
              "Failed to collaborator. Please try again later."
            );
          }
          navigation.navigate("NoteSettings", {
            id: route.params.repositoryId,
          });
          Alert.alert("Success", "Removed collaborator from the note.");
        }}
      >
        <Icon
          name="minus-circle"
          type="feather"
          color={isRepositoryCreator ? "#000" : "#aaa"}
        />
        <ListItem.Content>
          <ListItem.Title
            style={{ color: isRepositoryCreator ? "#000" : "#aaa" }}
          >
            Remove collaborator
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </ScrollScreenContainer>
  );
}
