import { Alert } from "react-native";
import sendOneTimeKeysMutation from "../../graphql/sendOneTimeKeysMutation";
import { addDebugLogEntry } from "../../stores/debugStore";
import * as deviceStore from "../../stores/deviceStore";
import {
  generateOneTimeKeysAndSaveDevice,
  createAuthenticationToken,
} from "../device";

const sendOneTimeKeys = async (client: any, device: Olm.Account) => {
  // TODO check how many one time keys exists and do not generate new if there are plenty locally unpublished
  const oneTimeKeys = await generateOneTimeKeysAndSaveDevice(device, 5);
  addDebugLogEntry(
    `sendOneTimeKeys: ${oneTimeKeys.map((oneTimeKey) => {
      return `\n"${oneTimeKey.key}"`;
    })}`
  );
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
    addDebugLogEntry(
      `Failed to publish one-time keys: ${JSON.stringify(result)}`,
      "error"
    );
    console.error("Failed to publish one-time keys:", result);
  }
};

export default sendOneTimeKeys;
