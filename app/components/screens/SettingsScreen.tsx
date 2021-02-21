import React from "react";
import { ListItem, Icon } from "react-native-elements";
import { Alert } from "react-native";
import { useClient } from "urql";
import * as Updates from "expo-updates";
import Spacer from "../ui/Spacer";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import OutlineButton from "../ui/OutlineButton";
import ListItemButton from "../ui/ListItemButton";
import ListItemLink from "../ui/ListItemLink";
import ListWrapper from "../ui/ListWrapper";
import { getIdentityKeys } from "../../utils/device";
import { generateSigningPublicKey } from "../../utils/signing";
import useDevice from "../../hooks/useDevice";
import useUser from "../../hooks/useUser";
import usePrivateUserSigningKey from "../../hooks/usePrivateUserSigningKey";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import useBackoffPoll from "../../hooks/useBackoffPoll";
import fetchPrivateInfo from "../../utils/server/fetchPrivateInfo";
import fetchAllLicenseTokens from "../../utils/server/fetchAllLicenseTokens";
import disconnectFromLicense from "../../utils/server/disconnectFromLicense";
import useLicenseTokens from "../../hooks/useLicenseTokens";
import useHasActiveLicense from "../../hooks/useHasActiveLicense";
import wipeStores from "../../utils/wipeStores";
import cleanupRemovedDevices from "../../utils/server/cleanupRemovedDevices";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import deleteUser from "../../utils/server/deleteUser";

export default function SettingsScreen({ navigation }) {
  const [processStep, setProcessStep] = React.useState<
    "default" | "deletingUser"
  >("default");
  const deviceResult = useDevice();
  const userResult = useUser();
  const privateUserSigningKeyResult = usePrivateUserSigningKey();
  const privateInfoResult = usePrivateInfo();
  const licenseTokensResult = useLicenseTokens();
  const hasActiveLicenseResult = useHasActiveLicense();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const client = useClient();
  // The Screen is only rendered when first mounted and that's when we
  // want to start the backoff polling. Therefor initial state must be true.
  // Only when the screen looses focus (it's not unmounted) the polling
  // should be stopped.
  const [dataPolling, setDataPolling] = React.useState(true);

  React.useEffect(() => {
    const unsubscribeNavigationFocus = navigation.addListener("focus", () => {
      setDataPolling(true);
      // fetch all licenses whenever switching to the tab
      if (deviceResult.type === "device") {
        fetchAllLicenseTokens(client, deviceResult.device);
      }
    });
    const unsubscribeNavigationBlur = navigation.addListener("blur", () => {
      setDataPolling(false);
    });
    return () => {
      unsubscribeNavigationFocus();
      unsubscribeNavigationBlur();
    };
  }, [navigation, deviceResult]);

  // When the component is removed we need to make sure polling is disabled
  React.useEffect(() => {
    return () => {
      setDataPolling(false);
    };
  }, []);

  useBackoffPoll(
    async () => {
      if (deviceResult.type === "device") {
        fetchPrivateInfo(client, deviceResult.device);
        cleanupRemovedDevices(
          client,
          deviceResult.device,
          fetchMyVerifiedDevices
        );
        // check for devicetombstones and if necessary update privateInfo
      }
    },
    [deviceResult],
    { active: dataPolling }
  );

  if (
    deviceResult.type === "loading" ||
    userResult.type === "loading" ||
    privateUserSigningKeyResult.type === "loading" ||
    privateInfoResult.type === "loading" ||
    licenseTokensResult.type === "loading" ||
    hasActiveLicenseResult.type === "loading"
  )
    return null;

  const yLinkedDevices = privateInfoResult.privateInfo.getMap("linkedDevices");

  return (
    <ScrollScreenContainer>
      <ListHeader>Your linked Devices</ListHeader>
      <ListWrapper>
        {Array.from(yLinkedDevices, ([key, yLinkedDevice], index) => {
          const isCurrentDevice =
            deviceResult.type === "device" &&
            getIdentityKeys(deviceResult.device).idKey === key;

          return (
            <ListItemLink
              topDivider={index !== 0}
              key={key}
              onPress={() => {
                navigation.navigate("DeviceScreen", { idKey: key });
              }}
            >
              {`${yLinkedDevice.get("name")}${
                isCurrentDevice ? " (Current Device)" : ""
              }`}
            </ListItemLink>
          );
        })}
      </ListWrapper>

      <ListItemButton
        style={{
          marginTop: 10,
        }}
        onPress={() => {
          const maxLinkedDevices = 3;
          if (
            !hasActiveLicenseResult.hasActiveLicense &&
            Array.from(yLinkedDevices).length >= maxLinkedDevices
          ) {
            // Alert.alert(
            //   "You are on a free account.",
            //   `To link more than ${maxLinkedDevices} devices please upgrade your account.`
            // );
            Alert.alert(
              "Sorry",
              `You account supports max. ${maxLinkedDevices} linked devices.`
            );
            return;
          }
          navigation.navigate("VerifyAddDeviceToExistingUserScreen");
        }}
      >
        {/* color={userResult.type === "user" ? "#000" : "#aaa"} */}
        Link Device to your Account
      </ListItemButton>

      {licenseTokensResult.licenseTokens.length === 0 ? null : (
        <>
          <Spacer />

          <ListHeader>Account</ListHeader>
          {licenseTokensResult.licenseTokens.length === 0 ? (
            <>
              <ListItem
                bottomDivider
                onPress={() => {
                  navigation.navigate("AddLicenseTokenScreen");
                }}
              >
                <ListItem.Content>
                  <Icon name="plus-circle" type="feather" />
                  <ListItem.Title>Add License Key</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </>
          ) : (
            <>
              {licenseTokensResult.licenseTokens.map((licenseToken) => {
                const subscriptionPlan =
                  licenseToken.subscriptionPlan === "PERSONAL_PRO"
                    ? "Personal Pro"
                    : "Team";
                return (
                  <ListItem key={licenseToken.token} bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>
                        {`Plan: ${subscriptionPlan}${
                          licenseToken.isActive === false ? " (inactive)" : ""
                        }`}
                      </ListItem.Title>
                    </ListItem.Content>
                    <OutlineButton
                      align="center"
                      onPress={async () => {
                        if (deviceResult.type !== "device") {
                          Alert.alert(
                            "Failed",
                            "Device is not properly setup."
                          );
                          return;
                        }

                        try {
                          await disconnectFromLicense(
                            licenseToken.token,
                            client,
                            deviceResult.device
                          );
                          await fetchAllLicenseTokens(
                            client,
                            deviceResult.device
                          );
                          Alert.alert(
                            // "Successfully removed the license key."
                            "Successfully removed."
                          );
                        } catch (err) {
                          Alert.alert(
                            "Failed to remove.",
                            "Please try again or contact support."
                          );
                        }
                      }}
                    >
                      Remove
                    </OutlineButton>
                  </ListItem>
                );
              })}
            </>
          )}
        </>
      )}

      <Spacer />

      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label="User ID">
          {userResult.type === "user"
            ? userResult.user.id
            : "User not initialized"}
        </ListItemInfo>
        <ListItemInfo topDivider label="User Signing Key (public)">
          {privateUserSigningKeyResult.type === "privateUserSigningKey"
            ? generateSigningPublicKey(
                privateUserSigningKeyResult.privateUserSigningKey
              )
            : "User Signing Key not initialized"}
        </ListItemInfo>
      </ListWrapper>

      <Spacer />
      <ListHeader>Advanced Actions</ListHeader>

      <OutlineButton
        iconType="minus"
        disabled={processStep === "deletingUser"}
        onPress={async () => {
          if (processStep === "deletingUser") return;
          Alert.alert(
            "Warning",
            "Are you sure you want delete your user account and remove all your notes and contacts?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  setProcessStep("deletingUser");
                  try {
                    if (deviceResult.type !== "device") {
                      throw new Error("Device Information missing.");
                    }
                    await deleteUser(client, deviceResult.device);
                    await wipeStores();
                    await Updates.reloadAsync();
                  } catch (err) {
                    Alert.alert(
                      "Error",
                      "Failed to delete the user. Please contact hi@serenity.re"
                    );
                    setProcessStep("default");
                  }
                },
              },
            ]
          );
        }}
      >
        Delete User Account
      </OutlineButton>
      <OutlineButton
        iconType="minus"
        style={{
          marginTop: 10,
        }}
        onPress={async () => {
          Alert.alert(
            "Warning",
            "Are you sure you want delete only the local data and delete the current device information without removing it from your user account?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  await wipeStores();
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        }}
      >
        Remove all local Data
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
