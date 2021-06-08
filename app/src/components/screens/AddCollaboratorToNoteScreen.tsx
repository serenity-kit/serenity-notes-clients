import React from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
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
import ServerSyncInfo from "../ui/ServerSyncInfo";
import { DeviceKeys } from "../../types";
import { verifyDevice } from "../../utils/signing";
import colors from "../../styles/colors";
import OutlineButton from "../ui/OutlineButton";
import Text from "../ui/Text";

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
  // TODO use one hook to calculate the diff contact & contactinvitation between local and server. use it here and in contacts
  const contactsAndContactInvitations = useContactsAndContactInvitations(
    navigation
  );

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo" ||
    repositoryResult.type !== "repository"
  )
    return <View style={styles.container}></View>;

  const contacts = Array.from(
    privateInfoResult.privateInfo.getMap("contacts").entries()
  ).map(([userId, yContact]) => {
    return {
      type: "contact",
      id: userId,
      name: yContact.get("name"),
      userSigningKey: yContact.get("userSigningKey"),
    };
  });

  let contactsWithoutRepositoryCollaborators = [];
  const repositoryCollaboratorIds = repositoryResult.repository.collaborators
    ? repositoryResult.repository.collaborators.map(
        (collaborator) => collaborator.id
      )
    : [];
  contactsWithoutRepositoryCollaborators = contacts.filter(
    (contact) => !repositoryCollaboratorIds.includes(contact.id)
  );

  return (
    <View style={styles.container}>
      <ServerSyncInfo />

      {contacts.length === 0 ? (
        <EmptyList iconName="users">
          <Text>No Contacts</Text>
        </EmptyList>
      ) : (
        <FlatList
          data={contactsWithoutRepositoryCollaborators}
          renderItem={({ item }: { item }) => {
            return (
              <OutlineButton
                style={{ marginTop: 5 }}
                iconType="plus"
                disabled={processStep === "addingCollaborator"}
                onPress={async () => {
                  if (contactsAndContactInvitations.type !== "result") {
                    Alert.alert(
                      "Error",
                      "Can't connect to the server. Please try again or contact hi@serenity.re."
                    );
                    return;
                  }

                  const contactFromServer = contactsAndContactInvitations.contacts.find(
                    (contact) => contact.contactUserId === item.id
                  );
                  if (!contactFromServer) {
                    Alert.alert(
                      "Error",
                      "There was an error trying to add the contact. Please try again or contact hi@serenity.re."
                    );
                    return;
                  }
                  setProcessStep("addingCollaborator");
                  await addCollaboratorToRepository(
                    client,
                    route.params.repositoryId,
                    contactFromServer.id,
                    item.userSigningKey,
                    deviceResult.device,
                    navigation
                  );
                  setProcessStep("default");
                }}
              >
                {item.name}
              </OutlineButton>
            );
          }}
        />
      )}
    </View>
  );
}
