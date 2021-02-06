import deleteDeviceMutation from "../../graphql/deleteDeviceMutation";
import { createAuthenticationToken } from "../device";

const deleteDevice = async (
  client: any,
  deviceIdKey: string,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      deleteDeviceMutation,
      { input: { deviceIdKey } },
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

  if (result?.data?.deleteDevice?.success) {
    return true;
  } else {
    throw new Error("Failed to delete the device.");
  }
};

export default deleteDevice;
