import React from "react";
import { Alert, View } from "react-native";
import { Divider } from "react-native-paper";
import { useClient, useMutation } from "urql";
import * as deviceStore from "../../utils/deviceStore";
import useDevice from "../../hooks/useDevice";
import useUser from "../../hooks/useUser";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import * as privateUserSigningKeyStore from "../../stores/privateUserSigningKeyStore";
import * as privateInfoStore from "../../stores/privateInfoStore";
import * as userStore from "../../stores/userStore";
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
import OutlineButton from "../ui/OutlineButton";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import TextInput from "../ui/TextInput";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import fetchAddDeviceVerification from "../../utils/server/fetchAddDeviceVerification";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import getDeviceName from "../../utils/getDeviceName/getDeviceName";
import { Y } from "../../vendor/index.js";
import * as deviceLinkingIdentification from "../../utils/deviceLinkingIdentification";
import share from "../../utils/share/share";

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
    userResult.type === "loading" ||
    privateUserSigningKeyResult.type === "loading"
  )
    return null;

  if (deviceResult.type === "notFound") {
    return (
      <ScrollScreenContainer>
        <View style={{ marginHorizontal: 10 }}>
          <Spacer />
          <Text>
            Failed to load the device. Please contact support at hi@serenity.re
          </Text>
        </View>
      </ScrollScreenContainer>
    );
  }

  return (
    <ScrollScreenContainer>
      <View style={{ marginHorizontal: 10 }}>
        <Spacer />
        <Text>
          <Text weight={"bold"}>Step 1: </Text>
          {`On your existing Device go to "Setting" and then "Link Device to your Account".`}
        </Text>
        <Spacer />
        <Divider />
        <Spacer />
        <Text>
          <Text weight={"bold"}>Step 2: </Text>
          {`Copy the "Device Identification" to your existing Device.`}
        </Text>
        <Spacer />
        <TextInput
          placeholder="Device Identification"
          value={message}
          multiline
        />
        <Spacer />
      </View>
      <OutlineButton
        align="center"
        iconType="share"
        disabled={processStep === "verifying"}
        onPress={async () => {
          await share(message);
        }}
      >
        Share Device Identification
      </OutlineButton>
      <View style={{ marginHorizontal: 10 }}>
        <Spacer />
        <Divider />
        <Spacer />
        <Text>
          <Text weight={"bold"}>Step 3: </Text> Enter the{" "}
          {'"Verification Code"'} presented on your existing device.
        </Text>
        <Spacer />
        <TextInput
          placeholder="Verification Code"
          value={verificationCode}
          onChangeText={(value) => setVerificationCode(value)}
        />
        <Spacer />
      </View>
      <OutlineButton
        align="center"
        iconType="verify"
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
                'Couldn\'t find the verification on the server. Please verify the "Verification Code".'
              );
              return;
            }
          } catch (err) {
            setProcessStep("default");
            Alert.alert(
              'Couldn\'t find the verification on the server. Please verify the "Verification Code".'
            );
            return;
          }

          const { privateUserSigningKey, userId } =
            await verifyAndExtractAddDeviceVerification(
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
            Alert.alert(
              "Failed to add the device",
              "One-time key publishing failed. Please try again."
            );
          }
        }}
      >
        Verify
      </OutlineButton>
      <Spacer />
    </ScrollScreenContainer>
  );
}
