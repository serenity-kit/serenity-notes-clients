import React from "react";
import { useClient } from "urql";
import { Alert } from "react-native";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import ListHeader from "../ui/ListHeader";
import ListItemInfo from "../ui/ListItemInfo";
import usePrivateInfo from "../../hooks/usePrivateInfo";
import * as privateInfoStore from "../../utils/privateInfoStore";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import deleteDevice from "../../utils/server/deleteDevice";
import useMyVerifiedDevices from "../../hooks/useMyVerifiedDevices";
import updatePrivateInfo from "../../utils/server/updatePrivateInfo";
import useDevice from "../../hooks/useDevice";
import { getIdentityKeys } from "../../utils/device";
import wipeStores from "../../utils/wipeStores";
import ListWrapper from "../ui/ListWrapper";
import OutlineButton from "../ui/OutlineButton";

export default function DeviceScreen({ navigation, route }) {
  const { idKey } = route.params;
  const privateInfoResult = usePrivateInfo();
  const deviceResult = useDevice();
  const client = useClient();
  const fetchMyVerifiedDevices = useMyVerifiedDevices();
  const [processStep, setProcessStep] = React.useState<
    "default" | "deletingDevice"
  >("default");

  if (
    deviceResult.type !== "device" ||
    privateInfoResult.type !== "privateInfo"
  )
    return null;

  const isCurrentDevice =
    deviceResult.type === "device" &&
    getIdentityKeys(deviceResult.device).idKey === idKey;

  const removeDeviceFromPrivateInfo = async () => {
    const privateInfoYDoc = await privateInfoStore.getPrivateInfo();
    const yLinkedDevices = privateInfoYDoc.getMap("linkedDevices");
    yLinkedDevices.delete(idKey);
    const verifiedDevices = await fetchMyVerifiedDevices();
    await updatePrivateInfo(
      privateInfoYDoc,
      client,
      deviceResult.device,
      verifiedDevices
    );
    await privateInfoStore.setPrivateInfo(privateInfoYDoc);
  };

  const deleteDeviceAction = async () => {
    setProcessStep("deletingDevice");

    try {
      await deleteDevice(client, idKey, deviceResult.device);
      if (isCurrentDevice) {
        await wipeStores();
        navigation.navigate("Goodbye");
      } else {
        await removeDeviceFromPrivateInfo();
        Alert.alert("Successfully deleted the device.");
        navigation.navigate("Settings");
      }
    } catch (err) {
      Alert.alert("Failed to delete the device. Please try again later.");
      setProcessStep("default");
    }
  };

  const yLinkedDevices = privateInfoResult.privateInfo.getMap("linkedDevices");
  let yLinkedDevicesCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _entry of yLinkedDevices) {
    yLinkedDevicesCount++;
  }
  const yLinkedDevice = yLinkedDevices.get(idKey);

  if (!yLinkedDevice)
    return (
      <ScrollScreenContainer horizontalPadding>
        <Spacer />
        <Text>This device has been deleted.</Text>
      </ScrollScreenContainer>
    );

  const deleteDisabled = processStep !== "default" || yLinkedDevicesCount <= 1;

  return (
    <ScrollScreenContainer>
      <ListHeader>Info</ListHeader>
      <ListWrapper>
        <ListItemInfo label="Name">
          {yLinkedDevice.get("name") || "Name missing (something went wrong)"}
        </ListItemInfo>
        <ListItemInfo label="ID Key" topDivider>
          {idKey}
        </ListItemInfo>

        <ListItemInfo label="Signing Key" topDivider>
          {yLinkedDevice.get("signingKey") ||
            "Key missing (something went wrong)"}
        </ListItemInfo>
      </ListWrapper>
      <Spacer />
      <OutlineButton
        iconType="minus"
        disabled={deleteDisabled}
        onPress={async () => {
          if (processStep === "deletingDevice") return;
          Alert.alert("Info", "Are you sure to delete the device?", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete Device",
              style: "destructive",
              onPress: deleteDeviceAction,
            },
          ]);
        }}
      >
        {deleteDisabled
          ? "Delete Device (can't delete last device)"
          : "Delete Device"}
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
