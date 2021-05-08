import connectToLicenseMutation from "../../graphql/connectToLicense";
import { createAuthenticationToken } from "../device";

const connectToLicense = async (
  licenseToken: string,
  client: any,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      connectToLicenseMutation,
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

  if (result?.data?.connectToLicense?.licenseToken) {
    return true;
  } else {
    throw new Error("Failed to connect to a license.");
  }
};

export default connectToLicense;
