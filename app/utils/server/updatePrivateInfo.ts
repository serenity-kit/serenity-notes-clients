import updatePrivateInfoMutation from "../../graphql/updatePrivateInfoMutation";
import {
  createGroupSession,
  createGroupSessionMessage,
  createAuthenticationToken,
  createRepositoryUpdate,
} from "../device";
import claimOneTimeKeys from "../../utils/server/claimOneTimeKeys";
import { Y } from "../../vendor/index.js";
import { uInt8ArrayToBase64 } from "../encoding";
import { DeviceKeys } from "../../types";

const updatePrivateInfo = async (
  yPrivateInfoDoc: any,
  client: any,
  device: Olm.Account,
  verifiedDevices: DeviceKeys[]
) => {
  const privateInfoGroupSession = createGroupSession();
  const oneTimeKeysWithDeviceIdKey = await claimOneTimeKeys(
    client,
    device,
    verifiedDevices
  );
  const privateInfoGroupSessionMessages = oneTimeKeysWithDeviceIdKey.map(
    (oneTimeKeyWithDeviceIdKey) => {
      return createGroupSessionMessage(
        privateInfoGroupSession.prevKeyMessage,
        device,
        oneTimeKeyWithDeviceIdKey.deviceIdKey,
        oneTimeKeyWithDeviceIdKey.oneTimeKey.key
      );
    }
  );

  const yState = Y.encodeStateAsUpdate(yPrivateInfoDoc);
  const yStateVector = uInt8ArrayToBase64(yState);
  const encryptedContent = createRepositoryUpdate(
    privateInfoGroupSession,
    device,
    yStateVector
  );

  const result = await client
    .mutation(
      updatePrivateInfoMutation,
      {
        input: {
          encryptedContent,
          privateInfoGroupSessionMessages,
        },
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

  if (result?.data?.updatePrivateInfo?.privateInfoContent) {
    return result.data.privateInfo;
  } else {
    throw new Error("Failed to update private info");
  }
};

export default updatePrivateInfo;
