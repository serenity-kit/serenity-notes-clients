import React from "react";
import { StyleSheet, View, SectionList, Text } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import useDevice from "../../hooks/useDevice";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useContactsAndContactInvitations from "../../hooks/useContactsAndContactInvitations";
import EmptyList from "../ui/EmptyList";
import LoadingView from "../ui/LoadingView";
import colors from "../../styles/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 14,
    paddingTop: 12,
  },
});

export default function ContactsScreen({ navigation }) {
  const deviceResult = useDevice();
  const privateInfoResult = usePrivateInfo();
  const contactsAndContactInvitationsResult = useContactsAndContactInvitations(
    navigation
  );

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return null;

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");
  const yContactInvitations = privateInfoResult.privateInfo.getMap(
    "contactInvitations"
  );

  return (
    <View style={styles.container}>
      <ListItem
        bottomDivider
        topDivider
        onPress={async () => {
          navigation.navigate("AcceptContactInvitationScreen");
        }}
      >
        <Icon name="plus-circle" type="feather" />
        <ListItem.Content>
          <ListItem.Title>Accept Contact Invitation</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <ListItem
        bottomDivider
        onPress={async () => {
          navigation.navigate("CreateContactInvitationScreen");
        }}
      >
        <Icon name="plus-circle" type="feather" />
        <ListItem.Content>
          <ListItem.Title>Create Contact Invitation</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      {/* style and show red error message box */}
      {contactsAndContactInvitationsResult.type === "error" ? (
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Failed to fetch contact data</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ) : null}

      {contactsAndContactInvitationsResult.type === "loading" ? (
        <LoadingView />
      ) : contactsAndContactInvitationsResult.type === "result" &&
        contactsAndContactInvitationsResult.contacts.length === 0 &&
        contactsAndContactInvitationsResult.contactInvitations.length === 0 ? (
        <EmptyList iconName="users">
          <Text style={{ fontSize: 18 }}>Empty in Contacts</Text>
        </EmptyList>
      ) : (
        <>
          {contactsAndContactInvitationsResult.type === "result" ? (
            <SectionList
              sections={[
                {
                  title: "Open Invitations",
                  data:
                    contactsAndContactInvitationsResult.contactInvitations
                      .length !== 0
                      ? contactsAndContactInvitationsResult.contactInvitations
                      : [{ type: "contactInvitationsEmpty" }],
                },
                {
                  title: "Contacts",
                  data:
                    contactsAndContactInvitationsResult.contacts.length !== 0
                      ? contactsAndContactInvitationsResult.contacts
                      : [{ type: "contactsEmpty" }],
                },
              ]}
              renderSectionHeader={({ section: { title } }) => (
                <ListItem
                  bottomDivider
                  containerStyle={{
                    backgroundColor: colors.background,
                    paddingTop: 20,
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title
                      style={{ fontWeight: "500", paddingTop: 18 }}
                    >
                      {title}
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item }) => {
                if (item.type === "contactsEmpty") {
                  return (
                    <ListItem bottomDivider>
                      <ListItem.Content>
                        <ListItem.Title style={{ color: "#aaa" }}>
                          No confirmed contacts
                        </ListItem.Title>
                      </ListItem.Content>
                    </ListItem>
                  );
                }
                if (item.type === "contactInvitationsEmpty") {
                  return (
                    <ListItem bottomDivider>
                      <ListItem.Content>
                        <ListItem.Title style={{ color: "#aaa" }}>
                          No open invitations
                        </ListItem.Title>
                      </ListItem.Content>
                    </ListItem>
                  );
                }
                if (item.type === "contactInvitation") {
                  const yContactInvitation = yContactInvitations.get(item.id);
                  const name = yContactInvitation
                    ? yContactInvitation.get("name")
                    : "Name missing (something went wrong)";
                  return (
                    <ListItem
                      bottomDivider
                      onPress={() => {
                        navigation.navigate("ContactInvitation", {
                          id: item.id,
                        });
                      }}
                    >
                      <ListItem.Content>
                        <ListItem.Title>{name}</ListItem.Title>
                      </ListItem.Content>
                      <ListItem.Chevron />
                    </ListItem>
                  );
                }
                const yContact = yContacts.get(item.contactUserId);
                const name = yContact
                  ? yContact.get("name")
                  : "Name missing (something went wrong)";
                return (
                  <ListItem
                    bottomDivider
                    onPress={() => {
                      navigation.navigate("Contact", {
                        id: item.id,
                        contactUserId: item.contactUserId,
                      });
                    }}
                  >
                    <ListItem.Content>
                      <ListItem.Title>{name}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                  </ListItem>
                );
              }}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
