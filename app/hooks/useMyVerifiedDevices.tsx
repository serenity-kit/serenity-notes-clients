import { useClient } from "urql";
import myDevices from "../graphql/myDevices";
import useDevice from "./useDevice";
import usePrivateUserSigningKey from "./usePrivateUserSigningKey";
import { createAuthenticationToken } from "../utils/device";
import { generateSigningPublicKey, verifyDevice } from "../utils/signing";
import * as privateUserSigningKeyStore from "../utils/privateUserSigningKeyStore";
import * as deviceStore from "../utils/deviceStore";

const useMyVerifiedDevices = () => {
  const client = useClient();
  // Use the hooks to make sure it triggers a re-render, but then we use the latest store version in fetchMyVerifiedDevices due some re-render issues where fetchMyVerifiedDevices is not up to date (namely completeContactInvitation)
  useDevice();
  usePrivateUserSigningKey();

  const fetchMyVerifiedDevices = async () => {
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

  return fetchMyVerifiedDevices;
};

export default useMyVerifiedDevices;
