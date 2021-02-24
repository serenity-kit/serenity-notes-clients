import React from "react";
import { StyleSheet, View, SectionList, Text } from "react-native";
import { ListItem } from "react-native-elements";
import useDevice from "../../hooks/useDevice";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useContactsAndContactInvitations from "../../hooks/useContactsAndContactInvitations";
import EmptyList from "../ui/EmptyList";
import LoadingView from "../ui/LoadingView";
import ListItemButton from "../ui/ListItemButton";
import ListItemLink from "../ui/ListItemLink";
import ListWrapper from "../ui/ListWrapper";
import colors from "../../styles/colors";
import ListItemDivider from "../ui/ListItemDivider";

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
      <ListItemButton
        onPress={async () => {
          navigation.navigate("AcceptContactInvitationScreen");
        }}
      >
        Accept Contact Invitation
      </ListItemButton>
      <ListItemButton
        style={{ marginTop: 10 }}
        onPress={async () => {
          navigation.navigate("CreateContactInvitationScreen");
        }}
      >
        Create Contact Invitation
      </ListItemButton>

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
        contactsAndContactInvitationsResult.contacts.length === 0 &&
        contactsAndContactInvitationsResult.contactInvitations.length === 0 ? (
        <EmptyList iconName="users">
          <Text style={{ fontSize: 18 }}>Empty in Contacts</Text>
        </EmptyList>
      ) : (
        <>
          {contactsAndContactInvitationsResult.type === "result" ? (
            <SectionList
              style={{ marginLeft: 10, marginRight: 10 }}
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
                  containerStyle={{
                    backgroundColor: colors.background,
                    paddingTop: 20,
                    marginLeft: -10,
                    marginRight: -10,
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
              renderItem={({ item, index }) => {
                if (item.type === "contactsEmpty") {
                  return (
                    <ListItem
                      style={{
                        borderRadius: 6,
                      }}
                      containerStyle={{
                        borderColor: colors.divider,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderRadius: 6,
                      }}
                    >
                      <ListItem.Content>
                        <ListItem.Title style={{ color: colors.textBrightest }}>
                          No confirmed contacts
                        </ListItem.Title>
                      </ListItem.Content>
                    </ListItem>
                  );
                }
                if (item.type === "contactInvitationsEmpty") {
                  return (
                    <ListItem
                      style={{
                        borderRadius: 6,
                      }}
                      containerStyle={{
                        borderColor: colors.divider,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderRadius: 6,
                      }}
                    >
                      <ListItem.Content>
                        <ListItem.Title style={{ color: colors.textBrightest }}>
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
                    <React.Fragment>
                      {index !== 0 ? <ListItemDivider /> : null}
                      <ListItemLink
                        style={{
                          borderTopLeftRadius: index === 0 ? 6 : 0,
                          borderTopRightRadius: index === 0 ? 6 : 0,
                          borderBottomLeftRadius:
                            index ===
                            contactsAndContactInvitationsResult
                              .contactInvitations.length -
                              1
                              ? 6
                              : 0,
                          borderBottomRightRadius:
                            index ===
                            contactsAndContactInvitationsResult
                              .contactInvitations.length -
                              1
                              ? 6
                              : 0,
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
                            index ===
                            contactsAndContactInvitationsResult
                              .contactInvitations.length -
                              1
                              ? 6
                              : 0,
                          borderBottomRightRadius:
                            index ===
                            contactsAndContactInvitationsResult
                              .contactInvitations.length -
                              1
                              ? 6
                              : 0,
                          borderBottomWidth:
                            index ===
                            contactsAndContactInvitationsResult
                              .contactInvitations.length -
                              1
                              ? StyleSheet.hairlineWidth
                              : 0,
                        }}
                        onPress={() => {
                          navigation.navigate("ContactInvitation", {
                            id: item.id,
                          });
                        }}
                      >
                        {name}
                      </ListItemLink>
                    </React.Fragment>
                  );
                }
                const yContact = yContacts.get(item.contactUserId);
                const name = yContact
                  ? yContact.get("name")
                  : "Name missing (something went wrong)";
                return (
                  <ListItemLink
                    topDivider={index !== 0}
                    style={{
                      borderTopLeftRadius: index === 0 ? 6 : 0,
                      borderTopRightRadius: index === 0 ? 6 : 0,
                      borderBottomLeftRadius:
                        index ===
                        contactsAndContactInvitationsResult.contacts.length - 1
                          ? 6
                          : 0,
                      borderBottomRightRadius:
                        index ===
                        contactsAndContactInvitationsResult.contacts.length - 1
                          ? 6
                          : 0,
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
                        index ===
                        contactsAndContactInvitationsResult.contacts.length - 1
                          ? 6
                          : 0,
                      borderBottomRightRadius:
                        index ===
                        contactsAndContactInvitationsResult.contacts.length - 1
                          ? 6
                          : 0,
                      borderBottomWidth:
                        index ===
                        contactsAndContactInvitationsResult.contacts.length - 1
                          ? StyleSheet.hairlineWidth
                          : 0,
                    }}
                    onPress={() => {
                      navigation.navigate("Contact", {
                        id: item.id,
                        contactUserId: item.contactUserId,
                      });
                    }}
                  >
                    {name}
                  </ListItemLink>
                );
              }}
            />
          ) : null}
        </>
      )}
    </View>
  );
}
