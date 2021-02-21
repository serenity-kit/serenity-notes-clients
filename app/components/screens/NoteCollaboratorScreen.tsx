import React from "react";
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
import ListWrapper from "../ui/ListWrapper";
import OutlineButton from "../ui/OutlineButton";

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
      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label={`Name`}>{name}</ListItemInfo>
      </ListWrapper>

      <Spacer />
      <ListHeader>Actions</ListHeader>
      <OutlineButton
        iconType="minus"
        disabled={!isRepositoryCreator}
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
        Remove collaborator
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
