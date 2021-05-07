import React from "react";
import { useMutation, useClient } from "urql";
import { StyleSheet, View, Alert } from "react-native";
import * as privateUserSigningKeyStore from "../../utils/privateUserSigningKeyStore";
import * as deviceStore from "../../utils/deviceStore";
import * as userStore from "../../utils/userStore";
import * as privateInfoStore from "../../utils/privateInfoStore";
import OutlineButton from "../ui/OutlineButton";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import {
  createDevice,
  getIdentityKeys,
  generateOneTimeKeysAndSaveDevice,
} from "../../utils/device";
import getFallbackKey from "../../utils/device/getFallbackKey";
import {
  generateSigningPrivateKey,
  generateSigningPublicKey,
  signDevice,
} from "../../utils/signing";
import getDeviceName from "../../utils/getDeviceName/getDeviceName";
import createUserMutation from "../../graphql/createUserMutation";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import { Y } from "../../vendor/index.js";
import { Icon } from "react-native-elements";
import colors from "../../styles/colors";
import ActivityIndicator from "../ui/ActivityIndicator";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
  },
  entry: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  list: {
    alignItems: "flex-start",
    alignSelf: "center",
  },
});

export default function OnboardingScreen({ navigation }) {
  const [processState, setProcessState] = React.useState<
    "default" | "createDeviceAndKeys" | "createUser" | "ready" | "failed"
  >("default");
  const [, createUser] = useMutation(createUserMutation);
  const client = useClient();

  const initDeviceAndCreateUser = async () => {
    setProcessState("createDeviceAndKeys");
    const device = await createDevice();
    await deviceStore.persistNewDevice(device);
    const identityKeys = await getIdentityKeys(device);
    const oneTimeKeys = await generateOneTimeKeysAndSaveDevice(device, 25);
    const privateUserSigningKey = generateSigningPrivateKey();
    privateUserSigningKeyStore.setPrivateUserSigningKey(privateUserSigningKey);
    const publicUserSigningKey = generateSigningPublicKey(
      privateUserSigningKey
    );
    const fallbackKey = getFallbackKey(device);

    setProcessState("createUser");
    const result = await createUser({
      input: {
        device: {
          idKey: identityKeys.idKey,
          oneTimeKeys: oneTimeKeys,
          signingKey: identityKeys.signingKey,
          signature: signDevice(identityKeys, privateUserSigningKey),
          fallbackKey: fallbackKey.fallbackKey,
          fallbackKeySignature: fallbackKey.fallbackKeySignature,
        },
        signingKey: publicUserSigningKey,
      },
    });
    if (result?.data?.createUser) {
      await userStore.setUser({ id: result.data.createUser.user.id });
      device.mark_keys_as_published();
      await deviceStore.persistDevice();
      const identityKeys = await getIdentityKeys(device);
      const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
      const yLinkedDevice = new Y.Map();
      yLinkedDevice.set("idKey", identityKeys.idKey);
      yLinkedDevice.set("signingKey", identityKeys.signingKey);
      yLinkedDevice.set("name", getDeviceName());
      yLinkedDevice.set("app", "documents");
      const yLinkedDevices = privateInfoYDoc.getMap("linkedDevices");
      yLinkedDevices.set(identityKeys.idKey, yLinkedDevice);
      await updatePrivateInfo(privateInfoYDoc, client, device, [
        { idKey: identityKeys.idKey, signingKey: identityKeys.signingKey },
      ]);
      await privateInfoStore.setPrivateInfo(privateInfoYDoc);
      setProcessState("ready");
    } else {
      Alert.alert("Failed to create user. Please try again later.");
      setProcessState("failed");
    }
  };

  React.useEffect(() => {
    initDeviceAndCreateUser();
  }, []);

  return (
    <View style={styles.container}>
      <Spacer />
      <Spacer />
      <Spacer />
      <Text weight="bold">How does the signup work?</Text>
      <Spacer size="s" />
      <Text>
        A new secret key is created on your device. The device then
        authenticates itself with the servers and creates a new user account.
      </Text>

      <Spacer />
      <Spacer />

      <Text weight="bold">Security</Text>
      <Spacer size="s" />
      <Text>
        All content is end-to-end encrypted. That said the data is only as
        secure as your device.
      </Text>
      <Spacer />
      <Spacer />
      <Spacer />
      <Spacer />
      <View style={styles.list}>
        <View style={styles.entry}>
          {/* avoid the text to jump left then right due the icon loading, by applying a fixed with */}
          <View style={{ width: 24 }}>
            {processState === "default" ? (
              <ActivityIndicator color={colors.background} />
            ) : null}
            {processState === "createDeviceAndKeys" ? (
              <ActivityIndicator />
            ) : null}
            {processState === "createUser" || processState === "ready" ? (
              <Icon
                name="check-circle"
                type="feather"
                color={"#000"}
                size={24}
              />
            ) : null}
          </View>
          <Text size="l">{"\xa0\xa0"} Creating Keys</Text>
        </View>
        <Spacer />
        <View style={styles.entry}>
          {processState === "default" ||
          processState === "createDeviceAndKeys" ? (
            <ActivityIndicator color={colors.background} />
          ) : null}
          {processState === "createUser" ? <ActivityIndicator /> : null}
          {processState === "ready" ? (
            <Icon name="check-circle" type="feather" color={"#000"} size={24} />
          ) : null}
          <Text size="l">{"\xa0\xa0"} Setting up User Account</Text>
        </View>
      </View>

      <Spacer />
      <Spacer />
      <Spacer />
      {processState === "failed" ? (
        <>
          <OutlineButton
            align="center"
            disabled={processState !== "failed"}
            onPress={() => {
              initDeviceAndCreateUser();
            }}
          >
            Try again
          </OutlineButton>
          <Spacer />
        </>
      ) : null}
      <OutlineButton
        align="center"
        disabled={processState !== "ready"}
        onPress={() => {
          navigation.navigate("MainApp", { screen: "Notes" });
        }}
      >
        Get started
      </OutlineButton>
      <Spacer />
      <View style={styles.content}>
        {processState === "ready" ? (
          <Text>Your device is ready.</Text>
        ) : (
          <Text> </Text>
        )}
      </View>
    </View>
  );
}
