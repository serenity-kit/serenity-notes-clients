import disconnectFromLicenseMutation from "../../graphql/disconnectFromLicense";
import { createAuthenticationToken } from "../device";

const disconnectFromLicense = async (
  licenseToken: string,
  client: any,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      disconnectFromLicenseMutation,
      { input: { licenseToken } },
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

  if (result?.data?.disconnectFromLicense?.success) {
    return true;
  } else {
    throw new Error("Failed to connect to a license.");
  }
};

export default disconnectFromLicense;
