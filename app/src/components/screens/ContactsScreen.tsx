import React from "react";
import { StyleSheet, View, SectionList } from "react-native";
import { ListItem, Icon } from "react-native-elements";
import useDevice from "../../hooks/useDevice";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useContactsAndContactInvitations from "../../hooks/useContactsAndContactInvitations";
import ListItemButton from "../ui/ListItemButton";
import ListItemLink from "../ui/ListItemLink";
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
  // also converts accepted contactInvitations to contacts
  const contactsAndContactInvitations = useContactsAndContactInvitations(
    navigation
  );

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return null;

  const contacts = Array.from(
    privateInfoResult.privateInfo.getMap("contacts").entries()
  ).map(([userId, yContact]) => {
    return {
      type: "contact",
      id: userId,
      name: yContact.get("name"),
    };
  });
  const contactInvitations = Array.from(
    privateInfoResult.privateInfo.getMap("contactInvitations").entries()
  ).map(([contactInvitationId, yContactInvitation]) => {
    return {
      type: "contactInvitation",
      id: contactInvitationId,
      name: yContactInvitation.get("name"),
    };
  });

  const serverContactInvitations = {};
  if (contactsAndContactInvitations.type === "result") {
    contactsAndContactInvitations.contactInvitations.forEach((invitation) => {
      serverContactInvitations[invitation.id] = true;
    });
  }

  const serverContacts = {};
  if (contactsAndContactInvitations.type === "result") {
    contactsAndContactInvitations.contacts.forEach((contact) => {
      serverContacts[contact.contactUserId] = true;
    });
  }

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

      <SectionList
        style={{ marginLeft: 10, marginRight: 10 }}
        sections={[
          {
            title: "Open Invitations",
            data:
              contactInvitations.length !== 0
                ? contactInvitations
                : [
                    {
                      type: "contactInvitationsEmpty",
                      id: "contactInvitationsEmpty",
                      name: "",
                    },
                  ],
          },
          {
            title: "Contacts",
            data:
              contacts.length !== 0
                ? contacts
                : [{ type: "contactsEmpty", id: "contactsEmpty", name: "" }],
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
              <ListItem.Title style={{ fontWeight: "500", paddingTop: 18 }}>
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
            return (
              <React.Fragment>
                {index !== 0 ? <ListItemDivider /> : null}
                <ListItemLink
                  style={{
                    borderTopLeftRadius: index === 0 ? 6 : 0,
                    borderTopRightRadius: index === 0 ? 6 : 0,
                    borderBottomLeftRadius:
                      index === contactInvitations.length - 1 ? 6 : 0,
                    borderBottomRightRadius:
                      index === contactInvitations.length - 1 ? 6 : 0,
                  }}
                  containerStyle={{
                    borderColor: colors.divider,
                    borderLeftWidth: StyleSheet.hairlineWidth,
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderTopLeftRadius: index === 0 ? 6 : 0,
                    borderTopRightRadius: index === 0 ? 6 : 0,
                    borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
                    borderBottomLeftRadius:
                      index === contactInvitations.length - 1 ? 6 : 0,
                    borderBottomRightRadius:
                      index === contactInvitations.length - 1 ? 6 : 0,
                    borderBottomWidth:
                      index === contactInvitations.length - 1
                        ? StyleSheet.hairlineWidth
                        : 0,
                  }}
                  onPress={() => {
                    navigation.navigate("ContactInvitation", {
                      id: item.id,
                    });
                  }}
                >
                  {item.name}
                  {contactsAndContactInvitations.type === "result" &&
                  !serverContactInvitations[item.id] ? (
                    <Icon
                      name="alert-triangle"
                      type="feather"
                      color={colors.error}
                      size={16}
                      style={{
                        display: "flex",
                        marginLeft: 10,
                        position: "relative",
                        bottom: -2,
                      }}
                    />
                  ) : null}
                </ListItemLink>
              </React.Fragment>
            );
          }
          return (
            <ListItemLink
              topDivider={index !== 0}
              style={{
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === 0 ? 6 : 0,
                borderBottomLeftRadius: index === contacts.length - 1 ? 6 : 0,
                borderBottomRightRadius: index === contacts.length - 1 ? 6 : 0,
              }}
              containerStyle={{
                borderColor: colors.divider,
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderTopLeftRadius: index === 0 ? 6 : 0,
                borderTopRightRadius: index === 0 ? 6 : 0,
                borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
                borderBottomLeftRadius: index === contacts.length - 1 ? 6 : 0,
                borderBottomRightRadius: index === contacts.length - 1 ? 6 : 0,
                borderBottomWidth:
                  index === contacts.length - 1 ? StyleSheet.hairlineWidth : 0,
              }}
              onPress={() => {
                navigation.navigate("Contact", { userId: item.id });
              }}
            >
              {item.name}
              {/* also cover error case when the contact user removed the contact on their side */}
              {contactsAndContactInvitations.type === "result" &&
              !serverContacts[item.id] ? (
                <Icon
                  name="alert-triangle"
                  type="feather"
                  color={colors.error}
                  size={16}
                  style={{
                    display: "flex",
                    marginLeft: 10,
                    position: "relative",
                    bottom: -2,
                  }}
                />
              ) : null}
            </ListItemLink>
          );
        }}
      />
    </View>
  );
}
