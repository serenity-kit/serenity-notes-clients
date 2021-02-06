import { Alert } from "react-native";
import sendOneTimeKeysMutation from "../../graphql/sendOneTimeKeysMutation";
import * as deviceStore from "../../utils/deviceStore";
import {
  generateOneTimeKeysAndSaveDevice,
  createAuthenticationToken,
} from "../device";

const sendOneTimeKeys = async (client: any, device: Olm.Account) => {
  // TODO check how many one time keys exists and do not generate new if there are plenty locally unpublished
  const oneTimeKeys = await generateOneTimeKeysAndSaveDevice(device, 5);
  const result = await client
    .mutation(
      sendOneTimeKeysMutation,
      {
        input: { oneTimeKeys },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `signed-utc-msg ${createAuthenticationToken(
              device
            )}`,
          },
        },
      }
    )
    .toPromise();

  if (result?.data?.sendOneTimeKeys) {
    device.mark_keys_as_published();
    await deviceStore.persistDevice();
  } else {
    Alert.alert("Failed to publish onetime keys.");
  }
};

export default sendOneTimeKeys;
