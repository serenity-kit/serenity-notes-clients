import fetchAddDeviceVerificationQuery from "../../graphql/fetchAddDeviceVerification";
import { createAuthenticationToken } from "../device";

const fetchAddDeviceVerification = async (
  client: any,
  deviceIdKey: string,
  serverSecret: string,
  device: Olm.Account
) => {
  const result = await client
    .query(
      fetchAddDeviceVerificationQuery,
      { deviceIdKey, serverSecret },
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

  if (result?.data?.fetchAddDeviceVerification?.verificationMessage) {
    return result.data.fetchAddDeviceVerification.verificationMessage;
  } else {
    throw new Error("Failed to fetch the device verification.");
  }
};

export default fetchAddDeviceVerification;
