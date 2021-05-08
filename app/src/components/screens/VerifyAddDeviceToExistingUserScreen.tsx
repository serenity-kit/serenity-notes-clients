import React from "react";
import { Alert, View } from "react-native";
import { Divider } from "react-native-paper";
import { useMutation, useClient } from "urql";
import useDevice from "../../hooks/useDevice";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import useUser from "../../hooks/useUser";
import addDeviceMutation from "../../graphql/addDevice";
import { createAddDeviceMessage } from "../../utils/device";
import { signDevice } from "../../utils/signing";
import { createAuthenticationToken } from "../../utils/device";
import { generateVerificationCode } from "../../utils/verification";
import unclaimedOneTimeKeysCount from "../../utils/server/unclaimedOneTimeKeysCount";
import sleep from "../../utils/sleep";
import { useUtilsContext } from "../../context/UtilsContext";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import TextInput from "../ui/TextInput";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import OutlineButton from "../ui/OutlineButton";
import * as privateInfoStore from "../../utils/privateInfoStore";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import * as deviceLinkingIdentification from "../../utils/deviceLinkingIdentification";
import share from "../../utils/share/share";

export default function AddDeviceScreen({ navigation }) {
  const [processStep, setProcessStep] = React.useState<
    "default" | "addingDevice" | "copyVerificationCode" | "encryptingAndSending"
  >("default");
  const { encryptAndUploadAllRepositories } = useUtilsContext();
  const deviceResult = useDevice();
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const [message, setMessage] = React.useState("");
  const [verificationCode2, setVerificationCode2] = React.useState("");
  const [serverSecret, setServerSecret] = React.useState("");
  const [, addDevice] = useMutation(addDeviceMutation);
  const client = useClient();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  React.useEffect(() => {
    navigation.addListener("beforeRemove", (evt) => {
      // only prevent the back button while encyrpting and sending the data
      // or when the final navigation is forced
      if (
        processStep !== "encryptingAndSending" ||
        evt?.data?.action?.payload?.params?.force
      ) {
        return;
      }

      // Prevent default behavior of leaving the screen
      evt.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        "Please wait",
        "It's important to finish the encryption & upload process. An interruption might lead to missing data on the new device."
      );
    });
  }, [navigation, processStep]);

  if (
    deviceResult.type === "loading" ||
    userResult.type === "loading" ||
    privateUserSigningKeyResult.type === "loading"
  )
    return null;

  if (
    deviceResult.type === "notFound" ||
    userResult.type === "notFound" ||
    privateUserSigningKeyResult.type === "notFound"
  ) {
    Alert.alert("Requires a fully setup user and device");
    return null;
  }

  const addDeviceToBackend = async () => {
    setProcessStep("addingDevice");

    const result = deviceLinkingIdentification.parse(message);
    const newServerSecret = generateVerificationCode();
    const newSerificationCode = generateVerificationCode();
    const privateUserSigningKey =
      privateUserSigningKeyResult.privateUserSigningKey;
    const verificationMessage = createAddDeviceMessage(
      deviceResult.device,
      result.idKey,
      result.oneTimeKey,
      `${result.secret} ${newSerificationCode} ${privateUserSigningKey} ${userResult.user.id} ${result.fallbackKey}`
    );

    const addDeviceMutationResult = await addDevice(
      {
        input: {
          device: {
            idKey: result.idKey,
            oneTimeKeys: [],
            signingKey: result.signingKey,
            signature: signDevice(
              { idKey: result.idKey, signingKey: result.signingKey },
              privateUserSigningKey
            ),
            fallbackKey: result.fallbackKey,
            fallbackKeySignature: result.fallbackKeySignature,
          },
          verificationMessage: JSON.stringify(verificationMessage),
          serverSecret: newServerSecret,
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              deviceResult.device
            )}`,
          },
        },
      }
    );

    if (addDeviceMutationResult?.data?.addDevice?.success) {
      setVerificationCode2(newSerificationCode);
      setServerSecret(newServerSecret);
      setProcessStep("copyVerificationCode");
    } else {
      Alert.alert("Failed to add the device. Please try again.");
      setProcessStep("default");
      return;
    }

    let pollForOneTimeKey = true;
    while (pollForOneTimeKey) {
      await sleep(1000); // to prevent DDos-ing the servers
      let unclaimedOneTimeKeysCountValue = 0;
      try {
        unclaimedOneTimeKeysCountValue = await unclaimedOneTimeKeysCount(
          client,
          deviceResult.device,
          result.idKey
        );
      } catch (err) {
        console.log(err);
      }

      // TODO fetch the claimed & unclaimed oneTimeKeys
      // then only if the amount is lower than
      // deviceResult.device.max_number_of_one_time_keys()
      // start to send more
      if (unclaimedOneTimeKeysCountValue > 0) {
        setProcessStep("encryptingAndSending");
        pollForOneTimeKey = false;

        try {
          const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
          const verifiedDevices = await fetchMyVerifiedDevices();
          // to share linkedDevices and contacts
          await updatePrivateInfo(
            privateInfoYDoc,
            client,
            deviceResult.device,
            verifiedDevices
          );
          await privateInfoStore.setPrivateInfo(privateInfoYDoc);

          await encryptAndUploadAllRepositories();
          // Alert.alert("Successfully added the device.");
          navigation.navigate("Settings", { force: true });
          return;
        } catch (err) {
          Alert.alert(
            "Failed to encrypt and upload existing content for the new device. Please try again."
          );
          navigation.navigate("Settings", { force: true });
        }
      }
    }
  };

  return (
    <ScrollScreenContainer>
      <Spacer />

      <View style={{ marginLeft: 10, marginRight: 10 }}>
        <Text>
          <Text weight={"bold"}>Step 1: </Text>
          {`On your new Device select "Add new Device to existing User" on the Welcome screen.`}
        </Text>
        <Spacer />
        <Divider />
        <Spacer />
        <Text>
          <Text weight={"bold"}>Step 2: </Text>
          {`Retrieve the "Device Identification" from the new device an paste it in here.`}
        </Text>
        <Spacer />
        <TextInput
          value={message}
          onChangeText={(value) => setMessage(value)}
          placeholder="Device Identification"
        />
      </View>
      <Spacer />

      <OutlineButton
        align="center"
        iconType="plus"
        onPress={addDeviceToBackend}
        disabled={processStep !== "default"}
        loading={processStep === "addingDevice"}
      >
        Add new Device to your User
      </OutlineButton>
      <View style={{ marginLeft: 10, marginRight: 10 }}>
        <Spacer />
        <Divider />
        <Spacer />
        <Text>
          <Text weight={"bold"}>Step 3: </Text>
          {`Copy the "Verification Code" in your new Device.`}
        </Text>
        <Spacer />
        <TextInput
          value={`${serverSecret}${verificationCode2}`}
          placeholder="Verification Code"
        />
        <Spacer />
      </View>
      <OutlineButton
        align="center"
        iconType="share"
        onPress={async () => {
          await share(`${serverSecret}${verificationCode2}`);
        }}
        disabled={processStep !== "copyVerificationCode"}
      >
        Share Verification Code
      </OutlineButton>
      {processStep === "encryptingAndSending" ? (
        <>
          <Spacer />
          <OutlineButton align="center" loading disabled onPress={() => null}>
            Encrypting and uploading data
          </OutlineButton>
        </>
      ) : null}
    </ScrollScreenContainer>
  );
}
