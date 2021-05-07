import React from "react";
import { Alert, View } from "react-native";
import { Divider } from "react-native-paper";
import { useClient } from "urql";
import useDevice from "../../hooks/useDevice";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import useUser from "../../hooks/useUser";
import { generateSigningPublicKey } from "../../utils/signing";
import { generateSecret } from "../../utils/verification";
import * as privateInfoStore from "../../utils/privateInfoStore";
import { Y } from "../../vendor/index.js";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import createContactInvitation from "../../utils/server/createContactInvitation";
import OutlineButton from "../ui/OutlineButton";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import TextInput from "../ui/TextInput";
import ListItemLink from "../ui/ListItemLink";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import * as contactInvitationIdentification from "../../utils/contactInvitationIdentification";
import ListWrapper from "../ui/ListWrapper";
import share from "../../utils/share/share";

export default function CreateContactInvitation({ navigation }) {
  const [processStep, setProcessStep] = React.useState<
    | "default"
    | "creatingInvitation"
    | "invitationCreated"
    | "invitationCodeCopied"
  >("default");
  const deviceResult = useDevice();
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const [contactName, setContactName] = React.useState("");
  const [invitationCode, setInvitationCode] = React.useState("");
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const client = useClient();

  if (
    deviceResult.type !== "device" ||
    userResult.type !== "user" ||
    privateUserSigningKeyResult.type !== "privateUserSigningKey"
  )
    return null;

  const createContactInvitationAction = async () => {
    if (contactName === "") {
      Alert.alert("Please provide a name");
      return;
    }

    setProcessStep("creatingInvitation");

    const serverSecret = generateSecret();
    const clientSecret = generateSecret();
    const newInvitation: contactInvitationIdentification.ContactInviation = {
      version: "1",
      userId: userResult.user.id,
      userSigningKey: generateSigningPublicKey(
        privateUserSigningKeyResult.privateUserSigningKey
      ),
      serverSecret,
      clientSecret,
    };
    const newInvitationCode = contactInvitationIdentification.stringify(
      newInvitation
    );

    try {
      const contactInvitationId = await createContactInvitation(
        client,
        deviceResult.device,
        serverSecret
      );
      const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
      const yContactInvitations = privateInfoYDoc.getMap("contactInvitations");
      const contactInvitation = new Y.Map();
      contactInvitation.set("name", contactName);
      contactInvitation.set("clientSecret", clientSecret);
      contactInvitation.set("serverSecret", serverSecret);
      contactInvitation.set("userId", newInvitation.userId);
      contactInvitation.set("userSigningKey", newInvitation.userSigningKey);
      yContactInvitations.set(contactInvitationId, contactInvitation);
      const verifiedDevices = await fetchMyVerifiedDevices();
      await updatePrivateInfo(
        privateInfoYDoc,
        client,
        deviceResult.device,
        verifiedDevices
      );
      await privateInfoStore.setPrivateInfo(privateInfoYDoc);
      setInvitationCode(newInvitationCode);
      setProcessStep("invitationCreated");
    } catch (err) {
      Alert.alert("Failed to create the invitation. Please try again later.");
      setProcessStep("default");
    }
  };

  return (
    <ScrollScreenContainer>
      <View style={{ paddingHorizontal: 10 }}>
        <Spacer />
        <Text color={processStep !== "default" ? "grey" : "default"}>
          {`Provide the contact's name. Hint: The contact's name will only be visible to you.`}
        </Text>
        <Spacer />
        <TextInput
          placeholder="Contact's Name"
          value={contactName}
          onChangeText={(value) => setContactName(value)}
          disabled={processStep !== "default"}
        />
        <Spacer />
      </View>
      <OutlineButton
        align="center"
        iconType="plus"
        onPress={createContactInvitationAction}
        disabled={processStep !== "default"}
        loading={processStep === "creatingInvitation"}
      >
        Create Invitation
      </OutlineButton>
      <View style={{ paddingHorizontal: 10 }}>
        <Spacer />
        <Divider />
        <Spacer />
        <Text color={processStep !== "invitationCreated" ? "grey" : "default"}>
          Send the invitation code to your contact. Once they accepted you can
          add them to notes and collaborate.
        </Text>
        <Spacer />
        <TextInput
          placeholder="Invitation Code"
          value={invitationCode}
          disabled={processStep !== "invitationCreated"}
          multiline
        />
        <Spacer />
      </View>
      <OutlineButton
        align="center"
        iconType="share"
        onPress={async () => {
          await share(invitationCode);
          setProcessStep("invitationCodeCopied");
        }}
        disabled={processStep !== "invitationCreated"}
      >
        Share Invitation Code
      </OutlineButton>
      <Spacer />
      <ListWrapper>
        <ListItemLink
          onPress={() => {
            navigation.navigate("ContactsList");
          }}
          disabled={processStep !== "invitationCodeCopied"}
        >
          Back to Contacts Overview
        </ListItemLink>
      </ListWrapper>
      <Spacer />
    </ScrollScreenContainer>
  );
}
