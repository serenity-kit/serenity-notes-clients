import React from "react";
import { StyleSheet, View, FlatList, Text, Alert } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import { useClient } from "urql";
import {
  createGroupSessionMessage,
  createAuthenticationToken,
  restoreGroupSession,
} from "../../utils/device";
import useDevice from "../../hooks/useDevice";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useRepository from "../../hooks/useRepository";
import * as repositoryStore from "../../utils/repositoryStore";
import claimOneTimeKeys from "../../utils/server/claimOneTimeKeys";
import devicesForContact from "../../graphql/devicesForContact";
import addCollaboratorToRepositoriesMutation from "../../graphql/addCollaboratorToRepositoriesMutation";
import EmptyList from "../ui/EmptyList";
import useContactsAndContactInvitations from "../../hooks/useContactsAndContactInvitations";
import LoadingView from "../ui/LoadingView";
import ServerSyncInfo from "../ui/ServerSyncInfo";
import { DeviceKeys } from "../../types";
import { verifyDevice } from "../../utils/signing";
import colors from "../../styles/colors";
import OutlineButton from "../ui/OutlineButton";
import ListWrapper from "../ui/ListWrapper";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
});

const addCollaboratorToRepository = async (
  client,
  repositoryId,
  contactId,
  userSigningKey,
  device,
  navigation
) => {
  const devicesForContactResult = await client
    .query(
      devicesForContact,
      { contactId },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              device
            )}`,
          },
        },
      }
    )
    .toPromise();

  const verifiedDevices: DeviceKeys[] = [];
  devicesForContactResult.data.devicesForContact.forEach((device) => {
    if (verifyDevice(device, userSigningKey)) {
      verifiedDevices.push(device);
    } else {
      console.error("Unverified contact device coming from the server!");
    }
  });

  const repository = await repositoryStore.getRepository(repositoryId);
  if (!repository.groupSession) {
    Alert.alert(
      "Please make at least one change in the document before you add a collaborator."
    );
    return null;
  }
  const groupSession = restoreGroupSession(repository.groupSession);
  // NOTE due fallbackKeys there always will be one key for each device
  const oneTimeKeysWithDeviceIdKey = await claimOneTimeKeys(
    client,
    device,
    verifiedDevices
  );
  const groupSessionMessages = oneTimeKeysWithDeviceIdKey.map(
    (oneTimeKeyWithDeviceIdKey) => {
      return createGroupSessionMessage(
        groupSession.prevKeyMessage,
        device,
        oneTimeKeyWithDeviceIdKey.deviceIdKey,
        oneTimeKeyWithDeviceIdKey.oneTimeKey.key
      );
    }
  );

  const repositoryGroupMessages = [
    {
      repositoryId: repository.serverId,
      groupSessionMessages,
    },
  ];

  const addCollaboratorToRepositoriesMutationResult = await client
    .mutation(
      addCollaboratorToRepositoriesMutation,
      {
        input: {
          repositoryGroupMessages,
          contactId,
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              device
            )}`,
          },
        },
      }
    )
    .toPromise();

  if (
    addCollaboratorToRepositoriesMutationResult?.data
      ?.addCollaboratorToRepositories?.entries?.length > 0
  ) {
    const repo2 = await repositoryStore.getRepository(repositoryId);
    await repositoryStore.setRepository({
      ...repo2,
      groupSessionMessageIds:
        addCollaboratorToRepositoriesMutationResult?.data
          ?.addCollaboratorToRepositories?.entries[0].groupSessionMessageIds,
    });
    Alert.alert("Added collaborator to this Note.");
    navigation.navigate("Note", { id: repositoryId, isNew: false });
  } else {
    Alert.alert("Failed to add the collaborator to this Note.");
  }
};

export default function AddCollaboratorToNoteScreen({ route, navigation }) {
  const [processStep, setProcessStep] = React.useState<
    "default" | "addingCollaborator"
  >("default");
  const deviceResult = useDevice();
  const privateInfoResult = usePrivateInfo();
  const repositoryResult = useRepository(route.params.repositoryId);
  const client = useClient();
  const contactsAndContactInvitationsResult = useContactsAndContactInvitations(
    navigation
  );

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo" ||
    repositoryResult.type !== "repository"
  )
    return <View style={styles.container}></View>;

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");

  let contactsWithoutRepositoryCollaborators = [];
  const repositoryCollaboratorIds = repositoryResult.repository.collaborators
    ? repositoryResult.repository.collaborators.map(
        (collaborator) => collaborator.id
      )
    : [];
  if (contactsAndContactInvitationsResult.type === "result") {
    contactsWithoutRepositoryCollaborators = contactsAndContactInvitationsResult.contacts.filter(
      (contact) => !repositoryCollaboratorIds.includes(contact.contactUserId)
    );
  }

  return (
    <View style={styles.container}>
      <ServerSyncInfo />

      {/* style and show red error message box */}
      {contactsAndContactInvitationsResult.type === "error" ? (
        <ListWrapper style={{ marginTop: 10 }}>
          <ListItem>
            <ListItem.Content>
              <ListItem.Title>Failed to fetch contact data</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </ListWrapper>
      ) : null}

      {contactsAndContactInvitationsResult.type === "loading" ? (
        <LoadingView />
      ) : contactsAndContactInvitationsResult.type === "result" &&
        contactsWithoutRepositoryCollaborators.length === 0 ? (
        <EmptyList iconName="users">
          <Text style={{ fontSize: 18 }}>Empty in Contacts</Text>
        </EmptyList>
      ) : (
        <FlatList
          data={contactsWithoutRepositoryCollaborators}
          renderItem={({ item }: { item }) => {
            const yContact = yContacts.get(item.contactUserId);
            const name = yContact
              ? yContact.get("name")
              : "Name missing (something went wrong)";
            const userSigningKey = yContact
              ? yContact.get("userSigningKey")
              : null;
            return (
              <OutlineButton
                style={{ marginTop: 5 }}
                iconType="plus"
                disabled={processStep === "addingCollaborator"}
                onPress={async () => {
                  setProcessStep("addingCollaborator");
                  await addCollaboratorToRepository(
                    client,
                    route.params.repositoryId,
                    item.id,
                    userSigningKey,
                    deviceResult.device,
                    navigation
                  );
                  setProcessStep("default");
                }}
              >
                {name}
              </OutlineButton>
            );
          }}
        />
      )}
    </View>
  );
}
