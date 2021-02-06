import React from "react";
import { Alert } from "react-native";
import { TextInput } from "react-native-paper";
import { useClient } from "urql";
import useDevice from "../../hooks/useDevice";
import Button from "../ui/Button";
import Spacer from "../ui/Spacer";
import Text from "../ui/Text";
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
        mode="outlined"
        label="License Key"
        value={licenseToken}
        onChangeText={(value) => setLicenseToken(value)}
        multiline
        disabled={processStep !== "default"}
        style={{ backgroundColor: "#fff" }}
      />
      <Spacer />
      <Button
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
      </Button>
    </ScrollScreenContainer>
  );
}
