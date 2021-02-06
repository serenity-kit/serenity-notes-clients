import React from "react";
import { Share, Alert } from "react-native";
import { TextInput, Divider } from "react-native-paper";
import { useClient, useMutation } from "urql";
import * as deviceStore from "../../utils/deviceStore";
import useDevice from "../../hooks/useDevice";
import useUser from "../../hooks/useUser";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import * as privateUserSigningKeyStore from "../../utils/privateUserSigningKeyStore";
import * as privateInfoStore from "../../utils/privateInfoStore";
import * as userStore from "../../utils/userStore";
import {
  generateOneTimeKeysAndSaveDevice,
  getIdentityKeys,
  createDevice,
  verifyAndExtractAddDeviceVerification,
  createAuthenticationToken,
} from "../../utils/device";
import getFallbackKey from "../../utils/device/getFallbackKey";
import sendOneTimeKeysMutation from "../../graphql/sendOneTimeKeysMutation";
import { generateVerificationCode } from "../../utils/verification";
import Button from "../ui/Button";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import fetchAddDeviceVerification from "../../utils/server/fetchAddDeviceVerification";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import getDeviceName from "../../utils/getDeviceName";
import { Y } from "../../vendor/index.js";
import * as deviceLinkingIdentification from "../../utils/deviceLinkingIdentification";

const generateVerficationMessage = async (
  device: Olm.Account,
  secret: string
) => {
  const identityKeys = getIdentityKeys(device);
  const fallbackKey = getFallbackKey(device);
  const oneTimeKeys = await generateOneTimeKeysAndSaveDevice(device, 1);

  const message = deviceLinkingIdentification.stringify({
    version: "1",
    idKey: identityKeys.idKey,
    signingKey: identityKeys.signingKey,
    oneTimeKey: oneTimeKeys[0].key,
    secret,
    fallbackKey: fallbackKey.fallbackKey,
    fallbackKeySignature: fallbackKey.fallbackKeySignature,
  });
  device.mark_keys_as_published();
  await deviceStore.persistDevice();

  return { message };
};

export default function AddDeviceToExistingUserScreen({ navigation }) {
  const [processStep, setProcessStep] = React.useState<"default" | "verifying">(
    "default"
  );
  const [secret] = React.useState(() => generateVerificationCode());
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const deviceResult = useDevice();
  const [message, setMessage] = React.useState("Loading …");
  const [verificationCode, setVerificationCode] = React.useState("");
  const [, sendOneTimeKeys] = useMutation(sendOneTimeKeysMutation);
  const client = useClient();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();

  React.useEffect(() => {
    const init = async () => {
      if (deviceResult.type === "notFound") {
        const device = await createDevice();
        await deviceStore.persistNewDevice(device);
      } else if (deviceResult.type === "device") {
        const result = await generateVerficationMessage(
          deviceResult.device,
          secret
        );
        setMessage(result.message);
      }
    };
    init();
  }, [deviceResult.type]);

  if (
    deviceResult.type === "loading" ||
    deviceResult.type === "notFound" ||
    userResult.type === "loading" ||
    privateUserSigningKeyResult.type === "loading"
  )
    return null;

  return (
    <ScrollScreenContainer horizontalPadding>
      <Spacer />
      <Text>
        <Text weight={"bold"}>Step 1: </Text>
        {`On your existing Device go to "Setting" and then "Verify new Device"`}
      </Text>
      <Spacer />
      <Divider />
      <Spacer />
      <Text>
        <Text weight={"bold"}>Step 2: </Text>
        {`Copy & paste the "Device Identification" to your existing Device`}
      </Text>
      <Spacer />
      <TextInput
        mode="outlined"
        label="Device Identification"
        value={message}
        multiline
        style={{ backgroundColor: "#fff" }}
      />
      <Spacer />
      <Button
        disabled={processStep === "verifying"}
        onPress={async () => {
          await Share.share({
            message,
          });
        }}
      >
        Share Device Identification
      </Button>
      <Spacer />
      <Divider />
      <Spacer />
      <Text>
        <Text weight={"bold"}>Step 3: </Text> Finalize adding the device by
        entering the verification code presented on your existing device.
      </Text>
      <Spacer />
      <TextInput
        mode="outlined"
        label="Verification Code"
        value={verificationCode}
        onChangeText={(value) => setVerificationCode(value)}
        style={{ backgroundColor: "#fff" }}
      />
      <Spacer />
      <Button
        disabled={processStep === "verifying"}
        loading={processStep === "verifying"}
        onPress={async () => {
          setProcessStep("verifying");

          const identityKeys = getIdentityKeys(deviceResult.device);
          const serverSeceret = verificationCode.substring(0, 6);
          const clientVerificationCode = verificationCode.substring(6);
          let verificationMessage = "";
          try {
            verificationMessage = await fetchAddDeviceVerification(
              client,
              identityKeys.idKey,
              serverSeceret,
              deviceResult.device
            );
            if (!verificationMessage) {
              setProcessStep("default");
              Alert.alert(
                "Couldn't find the verification on the server. Please verify the verification code."
              );
              return;
            }
          } catch (err) {
            setProcessStep("default");
            Alert.alert(
              "Couldn't find the verification on the server. Please verify the verification code."
            );
            return;
          }

          const {
            privateUserSigningKey,
            userId,
          } = await verifyAndExtractAddDeviceVerification(
            verificationMessage,
            deviceResult.device,
            secret,
            clientVerificationCode
          );
          await privateUserSigningKeyStore.setPrivateUserSigningKey(
            privateUserSigningKey
          );
          await userStore.setUser({ id: userId });

          const oneTimeKeys = await generateOneTimeKeysAndSaveDevice(
            deviceResult.device,
            // TODO could go up to the max allowed one time key number
            // deviceResult.device.max_number_of_one_time_keys()
            // probably better to take something lower to reduce the time waiting
            40
          );
          const sendOneTimeKeysResult = await sendOneTimeKeys(
            {
              input: { oneTimeKeys },
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

          if (sendOneTimeKeysResult?.data?.sendOneTimeKeys) {
            deviceResult.device.mark_keys_as_published();
            await deviceStore.persistDevice();
            const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
            const yLinkedDevice = new Y.Map();
            yLinkedDevice.set("idKey", identityKeys.idKey);
            yLinkedDevice.set("signingKey", identityKeys.signingKey);
            yLinkedDevice.set("name", getDeviceName());
            yLinkedDevice.set("app", "documents");
            const yLinkedDevices = privateInfoYDoc.getMap("linkedDevices");
            yLinkedDevices.set(identityKeys.idKey, yLinkedDevice);
            const verifiedDevices = await fetchMyVerifiedDevices();
            // to share the new device info
            await updatePrivateInfo(
              privateInfoYDoc,
              client,
              deviceResult.device,
              verifiedDevices
            );
            await privateInfoStore.setPrivateInfo(privateInfoYDoc);

            Alert.alert(
              "Successfully added the device",
              "Your existing device will now encrypt and upload your existing content for this device."
            );

            navigation.navigate("MainApp");
          } else {
            setProcessStep("default");
            Alert.alert("Failed to publish one-time keys.");
          }
        }}
      >
        Verify
      </Button>
    </ScrollScreenContainer>
  );
}
