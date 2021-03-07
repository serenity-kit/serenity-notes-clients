import React from "react";
import { ListItem } from "react-native-elements";
import { useClient } from "urql";
import Spacer from "../ui/Spacer";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import useRepository from "../../hooks/useRepository";
import useUser from "../../hooks/useUser";
import useDevice from "../../hooks/useDevice";
import { getIdentityKeys } from "../../utils/device";
import deleteRepository from "../../utils/server/deleteRepository";
import removeCollaboratorFromRepository from "../../utils/server/removeCollaboratorFromRepository";
import { Alert } from "react-native";
import * as repositoryStore from "../../utils/repositoryStore";
import Text from "../ui/Text";
import { RepositoryUpdate } from "../../types";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useVerifiedDevicesForRepository from "../../hooks/useVerifiedDevicesForRepository";
import { useSyncInfo } from "../../context/SyncInfoContext";
import ServerSyncInfo from "../ui/ServerSyncInfo";
import useHasActiveLicense from "../../hooks/useHasActiveLicense";
import ListWrapper from "../ui/ListWrapper";
import ListItemDivider from "../ui/ListItemDivider";
import OutlineButton from "../ui/OutlineButton";
import colors from "../../styles/colors";
import UploadArrow from "../ui/UploadArrow";
import DownloadArrow from "../ui/DownloadArrow";

export default function NoteSettingsScreen({ navigation, route }) {
  const repositoryResult = useRepository(route.params.id);
  const userResult = useUser();
  const deviceResult = useDevice();
  const verifiedDevicesForRepositoryResult = useVerifiedDevicesForRepository(
    route.params.id,
    navigation
  );
  const client = useClient();
  const privateInfoResult = usePrivateInfo();
  const hasActiveLicenseResult = useHasActiveLicense();

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
    privateInfoResult.type !== "privateInfo" ||
    // TODO add error when fetching verified devices fails
    verifiedDevicesForRepositoryResult.type !== "result" ||
    hasActiveLicenseResult.type === "loading"
  )
    return <ScrollScreenContainer />;

  const isRepositoryCreator =
    userResult.type === "user" &&
    repositoryResult.type === "repository" &&
    repositoryResult.repository.isCreator;

  const lastSyncUpdate = repositoryResult.repository.updates
    ? repositoryResult.repository.updates.find(
        (update) =>
          update.authorDeviceKey === getIdentityKeys(deviceResult.device).idKey
      )
    : null;

  const updates = repositoryResult.repository.updates
    ? repositoryResult.repository.updates.filter(
        (update) =>
          update.authorDeviceKey !== getIdentityKeys(deviceResult.device).idKey
      )
    : null;

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");
  const yLinkedDevices = privateInfoResult.privateInfo.getMap("linkedDevices");

  function findMyUpdate() {
    if (
      repositoryResult.type !== "repository" ||
      !repositoryResult.repository.collaborators ||
      verifiedDevicesForRepositoryResult.type !== "result" ||
      userResult.type !== "user"
    )
      return [];

    return updates.filter((update) => {
      // TODO should this rather use the devices list from the privateStore?!? then the hook could be removed
      return verifiedDevicesForRepositoryResult.devices.some(
        (device) =>
          update.authorDeviceKey === device.idKey &&
          device.userId === userResult.user.id
      );
    });
  }

  const myUpdates = findMyUpdate();

  const collaboratorsWithMostRecentUpdate = repositoryResult.repository
    .collaborators
    ? repositoryResult.repository.collaborators
        .filter(
          // filter out myself
          (collaborator) =>
            userResult.type === "user" && userResult.user.id !== collaborator.id
        )
        .map((collaborator) => {
          const collaboratorUpdates = updates.filter((update) => {
            return verifiedDevicesForRepositoryResult.devices.some(
              (device) =>
                update.authorDeviceKey === device.idKey &&
                device.userId === collaborator.id
            );
          });
          const mostRecentUpdate = collaboratorUpdates.sort(
            (updateA, updateB) =>
              // @ts-ignore
              new Date(updateB.createdAt) - new Date(updateA.createdAt)
          )[0];

          return {
            ...collaborator,
            mostRecentUpdate,
          };
        })
    : [];

  return (
    <ScrollScreenContainer>
      <ServerSyncInfo />
      <ListHeader>
        <UploadArrow
          animationActive={false}
          color={
            lastSyncUpdate?.type === "success" ? colors.success : colors.error
          }
          style={{ paddingRight: 8 }}
        />
        Send Updates
      </ListHeader>
      <ListWrapper>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title
              style={{
                color:
                  lastSyncUpdate?.type === "failed"
                    ? colors.error
                    : colors.text,
              }}
            >
              {lastSyncUpdate
                ? lastSyncUpdate.type === "success"
                  ? "Sending note updates succeeded"
                  : "Sending note updates failed"
                : "Sending note updates in progress"}
            </ListItem.Title>
            <ListItem.Subtitle style={{ fontSize: 12, color: "#8A8B96" }}>
              {lastSyncUpdate
                ? `${new Date(lastSyncUpdate.createdAt).toLocaleTimeString(
                    "en-US"
                  )}, ${new Date(lastSyncUpdate.createdAt).toDateString()}`
                : undefined}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </ListWrapper>
      <Spacer />
      <ListHeader>
        <DownloadArrow
          animationActive={false}
          color={colors.success}
          style={{ paddingRight: 8 }}
        />
        Updates from my linked Devices
      </ListHeader>
      <ListWrapper>
        {myUpdates && myUpdates.length > 0 ? (
          myUpdates.map((update: RepositoryUpdate, index) => {
            const date = new Date(update.createdAt);
            const yLinkedDevice = yLinkedDevices.get(update.authorDeviceKey);
            return (
              <React.Fragment
                key={`${update.authorDeviceKey}-${update.createdAt}`}
              >
                {index !== 0 ? <ListItemDivider /> : null}
                <ListItem>
                  <ListItem.Content>
                    <ListItem.Title>
                      {yLinkedDevice
                        ? yLinkedDevice.get("name")
                        : `${update.authorDeviceKey} (Device ID Key)`}
                    </ListItem.Title>
                    <ListItem.Subtitle
                      style={{
                        fontSize: 12,
                        color:
                          update.type === "failed"
                            ? colors.error
                            : colors.textBrightest,
                      }}
                    >{`${
                      update.type === "success"
                        ? "Last update at"
                        : "Failed to decrypt last update at"
                    } ${date.toLocaleTimeString(
                      "en-US"
                    )}, ${date.toDateString()}`}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              </React.Fragment>
            );
          })
        ) : (
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>No updates received</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
      </ListWrapper>

      <Spacer />
      <ListHeader>
        <DownloadArrow
          animationActive={false}
          color={colors.success}
          style={{ paddingRight: 8 }}
        />
        Collaborators
      </ListHeader>
      <ListWrapper>
        {collaboratorsWithMostRecentUpdate.length > 0 ? (
          collaboratorsWithMostRecentUpdate.map((collaborator, index) => {
            const yContact = yContacts.get(collaborator.id);
            const name = yContact ? yContact.get("name") : "Unknown";
            const formattedCreatedAt = collaborator.mostRecentUpdate
              ? `${new Date(
                  collaborator.mostRecentUpdate.createdAt
                ).toLocaleTimeString("en-US")}, ${new Date(
                  collaborator.mostRecentUpdate.createdAt
                ).toDateString()}`
              : "";
            return (
              <React.Fragment key={collaborator.id}>
                {index !== 0 ? <ListItemDivider /> : null}
                <ListItem
                  onPress={() => {
                    navigation.navigate("NoteCollaborator", {
                      repositoryId: route.params.id,
                      collaboratorId: collaborator.id,
                    });
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title>{name}</ListItem.Title>
                    <ListItem.Subtitle
                      style={{
                        fontSize: 12,
                        color:
                          collaborator.mostRecentUpdate?.type === "failed"
                            ? colors.error
                            : colors.textBrightest,
                      }}
                    >{`${
                      collaborator.mostRecentUpdate
                        ? collaborator.mostRecentUpdate.type === "success"
                          ? "Last update at"
                          : "Failed to decrypt last update at"
                        : "Yet no update received"
                    } ${formattedCreatedAt}`}</ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron color={colors.primary} />
                </ListItem>
              </React.Fragment>
            );
          })
        ) : (
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>No collaborators</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
      </ListWrapper>

      <OutlineButton
        disabled={!isRepositoryCreator}
        style={{ marginTop: 10 }}
        iconType="plus"
        onPress={async () => {
          if (!repositoryResult.repository.serverId) {
            Alert.alert("Note first must be sucessfully synced to the server.");
            return;
          }
          if (!isRepositoryCreator) {
            Alert.alert("Currently only the creator can add collaborators.");
            return;
          }
          const maxCollaborators = 3;
          if (
            !hasActiveLicenseResult.hasActiveLicense &&
            repositoryResult.repository.collaborators &&
            Array.from(repositoryResult.repository.collaborators).length >=
              maxCollaborators
          ) {
            // Alert.alert(
            //   "You are on a free account.",
            //   `To add more than ${
            //     maxCollaborators - 1
            //   } collaborators please upgrade your account.`
            // );
            Alert.alert(
              "Sorry",
              `You account supports max. ${maxCollaborators} collaborators.`
            );
            return;
          }
          navigation.navigate("AddCollaboratorToNote", {
            repositoryId: route.params.id,
          });
        }}
      >
        Add Collaborator
      </OutlineButton>

      <Spacer />
      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label="Note ID (local)">{route.params.id}</ListItemInfo>
        <ListItemDivider />
        <ListItemInfo label="Note ID (server)">
          {repositoryResult.repository.serverId
            ? repositoryResult.repository.serverId
            : "Not yet synced"}
        </ListItemInfo>
      </ListWrapper>

      <Spacer />
      <ListHeader>Actions</ListHeader>

      <OutlineButton
        disabled={isRepositoryCreator}
        iconType="minus"
        onPress={async () => {
          if (!repositoryResult.repository.serverId) {
            Alert.alert("Note first must be sucessfully synced to the server.");
            return;
          }
          if (isRepositoryCreator) {
            Alert.alert(
              "Currently the note creator can't remove themselve from a note."
            );
            return;
          }
          if (userResult.type !== "user") {
            Alert.alert(
              "Removing yourself is only possible if you have an active user account."
            );
            return;
          }
          if (deviceResult.type !== "device") {
            Alert.alert("Device must be initiated.");
            return;
          }
          try {
            await removeCollaboratorFromRepository(
              client,
              repositoryResult.repository.serverId,
              userResult.user.id,
              deviceResult.device
            );
          } catch (err) {
            Alert.alert(
              "Failed",
              "Failed to remove yourselve as collaborator. Please try again later."
            );
          }
          await repositoryStore.deleteRepository(route.params.id);
          navigation.navigate("Notes");
          Alert.alert(
            "Success",
            "Removed yourself as collaborator from the note."
          );
        }}
      >
        Remove myself from the Note
      </OutlineButton>

      <OutlineButton
        disabled={!isRepositoryCreator}
        iconType="minus"
        style={{
          marginTop: 10,
        }}
        onPress={async () => {
          if (!repositoryResult.repository.serverId) {
            Alert.alert("Note first must be sucessfully synced to the server.");
            return;
          }
          if (!isRepositoryCreator) {
            Alert.alert("Currently only the creator can remove a note.");
            return;
          }
          try {
            await deleteRepository(
              client,
              repositoryResult.repository.serverId,
              deviceResult.device
            );
          } catch (err) {
            Alert.alert(
              "Failed",
              "Failed to delete the Note from the server. Please try again later."
            );
          }
          await repositoryStore.deleteRepository(route.params.id);
          navigation.navigate("Notes");
          Alert.alert("Success", "Deleted the Note.");
        }}
      >
        Delete Note
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
