import myDevices from "../../graphql/myDevices";
import { createAuthenticationToken } from "../device";
import * as deviceStore from "../../utils/deviceStore";
import * as privateUserSigningKeyStore from "../../utils/privateUserSigningKeyStore";
import { generateSigningPublicKey, verifyDevice } from "../../utils/signing";

const fetchMyVerifiedDevices = async (client: any) => {
  const device = await deviceStore.getDevice();
  const privateUserSigningKey = await privateUserSigningKeyStore.getPrivateUserSigningKey();

  const result = await client
    .query(
      myDevices,
      {},
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

  if (result?.data?.devices) {
    const publicUserSigningKey = generateSigningPublicKey(
      privateUserSigningKey
    );
    return result?.data?.devices.filter((device: any) => {
      return verifyDevice(device, publicUserSigningKey);
    });
  } else {
    throw new Error("Failed to load devices");
  }
};

export default fetchMyVerifiedDevices;
