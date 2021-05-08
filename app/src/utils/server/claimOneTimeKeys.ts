import { v4 as uuidv4 } from "uuid";
import claimOneTimeKeysMutation from "../../graphql/claimOneTimeKeysMutation";
import { createAuthenticationToken } from "../device";
import { verifyOneTimeKey } from "../../utils/signing";
import { DeviceKeys } from "../../types";

type OneTimeKeysWithDeviceIdKey = {
  oneTimeKey: { key: string; signature: string };
  deviceIdKey: string;
};

const claimOneTimeKeys = async (
  client: any,
  device: Olm.Account,
  verifiedDevices: DeviceKeys[]
): Promise<OneTimeKeysWithDeviceIdKey[]> => {
  const deviceIdKeys = verifiedDevices.map(
    (targetDevice) => targetDevice.idKey
  );
  const requestId = uuidv4();
  const result = await client
    .mutation(
      claimOneTimeKeysMutation,
      // NOTE generating a unique requestId to make sure the input is
      // always different since urql seems to dedupe mutations with the
      // exact same input even if the headers are different.
      // How to reproduce:
      // create a note, link device, edit note on new device, remove the device, link the device again, repository update fails (remove and link again devices eventually will fail)
      // It fails because updatePrivateInfo and update repository try to
      // claim a oneTimeKey at the same time.
      { input: { deviceIdKeys, requestId } },
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

  if (
    result?.data?.claimOneTimeKeysForMultipleDevices?.oneTimeKeysWithDeviceIdKey
  ) {
    // TODO user should receive a warning in case oneTimeKeys are filtered out because they are not properly signed
    const verifiedOneTimeKeys = result.data.claimOneTimeKeysForMultipleDevices.oneTimeKeysWithDeviceIdKey.filter(
      (oneTimeKeysWithDeviceIdKey: OneTimeKeysWithDeviceIdKey) => {
        const device = verifiedDevices.find(
          (device) => device.idKey === oneTimeKeysWithDeviceIdKey.deviceIdKey
        );
        if (!device) return false;
        return verifyOneTimeKey(
          device.signingKey,
          oneTimeKeysWithDeviceIdKey.oneTimeKey.key,
          oneTimeKeysWithDeviceIdKey.oneTimeKey.signature
        );
      }
    );

    return verifiedOneTimeKeys;
  } else {
    throw new Error(`Failed to claim oneTimeKeys for: ${deviceIdKeys}`);
  }
};

export default claimOneTimeKeys;
