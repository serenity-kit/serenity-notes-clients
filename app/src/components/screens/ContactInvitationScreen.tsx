import React from "react";
import { useClient } from "urql";
import { Alert } from "react-native";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import * as privateInfoStore from "../../stores/privateInfoStore";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import ListWrapper from "../ui/ListWrapper";
import OutlineButton from "../ui/OutlineButton";
import deleteContactInvitation from "../../utils/server/deleteContactInvitation";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import useDevice from "../../hooks/useDevice";
import * as contactInvitationIdentification from "../../utils/contactInvitationIdentification";

export default function ContactInvitationScreen({ navigation, route }) {
  const { id } = route.params;
  const privateInfoResult = usePrivateInfo();
  const deviceResult = useDevice();
  const client = useClient();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [processStep, setProcessStep] = React.useState<
    "default" | "deletingInvitation"
  >("default");

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return null;

  const deleteContactInvitationAction = async () => {
    if (processStep === "deletingInvitation") return;

    setProcessStep("deletingInvitation");

    try {
      await deleteContactInvitation(client, id, deviceResult.device);
      const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
      const yContactInvitations = privateInfoYDoc.getMap("contactInvitations");
      yContactInvitations.delete(id);
      const verifiedDevices = await fetchMyVerifiedDevices();
      await updatePrivateInfo(
        privateInfoYDoc,
        client,
        deviceResult.device,
        verifiedDevices
      );
      await privateInfoStore.setPrivateInfo(privateInfoYDoc);
      Alert.alert("Successfully deleted the invitation.");
      navigation.navigate("ContactsList");
    } catch (err) {
      Alert.alert("Failed to delete the invitation. Please try again later.");
      setProcessStep("default");
    }
  };

  const yContactInvitations =
    privateInfoResult.privateInfo.getMap("contactInvitations");
  const contactInvitation = yContactInvitations.get(id);

  // during deletion
  if (!contactInvitation) return null;

  const invitation: contactInvitationIdentification.ContactInviation = {
    version: "1",
    userId: contactInvitation.get("userId"),
    userSigningKey: contactInvitation.get("userSigningKey"),
    serverSecret: contactInvitation.get("serverSecret"),
    clientSecret: contactInvitation.get("clientSecret"),
  };
  const invitationCode = contactInvitationIdentification.stringify(invitation);

  return (
    <ScrollScreenContainer>
      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label="Name">
          {contactInvitation.get("name") ||
            "Name missing (something went wrong)"}
        </ListItemInfo>
        <ListItemInfo label="Invitation Code" topDivider>
          {invitationCode}
        </ListItemInfo>
      </ListWrapper>
      <ListHeader>Actions</ListHeader>
      <OutlineButton
        onPress={deleteContactInvitationAction}
        disabled={processStep === "deletingInvitation"}
        iconType="minus"
      >
        Delete Contact Invitation
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
