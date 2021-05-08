import React from "react";
import { Alert } from "react-native";
import { useClient } from "urql";
import useDevice from "../../hooks/useDevice";
import OutlineButton from "../ui/OutlineButton";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
import TextInput from "../ui/TextInput";
import ScrollScreenContainer from "../ui/ScrollScreenContainer";
import connectToLicense from "../../utils/server/connectToLicense";

export default function AddLicenseTokenScreen({ navigation }) {
  const deviceResult = useDevice();
  const client = useClient();
  const [processStep, setProcessStep] = React.useState<"default" | "adding">(
    "default"
  );
  const [licenseToken, setLicenseToken] = React.useState("");

  if (deviceResult.type !== "device") return null;

  return (
    <ScrollScreenContainer horizontalPadding>
      <Spacer />
      <Text>Please fill in your License key and press the button.</Text>
      <Spacer />
      <TextInput
        placeholder="License Key"
        value={licenseToken}
        onChangeText={(value) => setLicenseToken(value)}
        multiline
        disabled={processStep !== "default"}
      />
      <Spacer />
      <OutlineButton
        align="center"
        disabled={processStep === "adding"}
        loading={processStep === "adding"}
        onPress={async () => {
          setProcessStep("adding");
          try {
            await connectToLicense(
              licenseToken.trim(),
              client,
              deviceResult.device
            );
            Alert.alert("Success", "Successfully added the license key.");
            setProcessStep("default");
            navigation.navigate("Settings", { force: true });
          } catch (err) {
            setProcessStep("default");
            Alert.alert(
              "Failed to add the license key",
              "Please verify the license key and try again."
            );
          }
        }}
      >
        Add Licence
      </OutlineButton>
    </ScrollScreenContainer>
  );
}
