import React from "react";
import { useClient } from "urql";
import { Alert } from "react-native";
import Spacer from "../ui/Spacer";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import ListWrapper from "../ui/ListWrapper";
import OutlineButton from "../ui/OutlineButton";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import * as privateInfoStore from "../../utils/privateInfoStore";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import deleteContact from "../../utils/server/deleteContact";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import useDevice from "../../hooks/useDevice";

export default function ContactScreen({ navigation, route }) {
  const { id, contactUserId } = route.params;
  const privateInfoResult = usePrivateInfo();
  const deviceResult = useDevice();
  const client = useClient();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [processStep, setProcessStep] = React.useState<
    "default" | "deletingContact"
  >("default");

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return null;

  const deleteContactAction = async () => {
    setProcessStep("deletingContact");

    try {
      await deleteContact(client, id, deviceResult.device);
      const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
      const yContacts = privateInfoYDoc.getMap("contacts");
      yContacts.delete(id);
      const verifiedDevices = await fetchMyVerifiedDevices();
      await updatePrivateInfo(
        privateInfoYDoc,
        client,
        deviceResult.device,
        verifiedDevices
      );
      await privateInfoStore.setPrivateInfo(privateInfoYDoc);
      Alert.alert("Successfully deleted the contact.");
      navigation.navigate("ContactsList");
    } catch (err) {
      Alert.alert("Failed to delete the contact. Please try again later.");
      setProcessStep("default");
    }
  };

  const yContacts = privateInfoResult.privateInfo.getMap("contacts");
  const yContact = yContacts.get(contactUserId);

  return (
    <ScrollScreenContainer>
      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label="Name">
          {yContact.get("name") || "Name missing (something went wrong)"}
        </ListItemInfo>
        <ListItemInfo label="User ID" topDivider>
          {id || "ID missing (something went wrong)"}
        </ListItemInfo>
        <ListItemInfo label="User Signing Key (public)" topDivider>
          {yContact.get("userSigningKey") ||
            "Key missing (something went wrong)"}
        </ListItemInfo>
      </ListWrapper>
      <ListHeader>Actions</ListHeader>

      <OutlineButton
        iconType="minus"
        onPress={async () => {
          if (processStep === "deletingContact") return;
          Alert.alert(
            "Info",
            "This will not remove the user from your notes. The other user still will have access to the current version of your notes, but updates won't be shared. Removing the user from a note can be done in the note settings.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete Contact",
                style: "destructive",
                onPress: deleteContactAction,
              },
            ]
          );
        }}
      >
        Delete Contact
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
