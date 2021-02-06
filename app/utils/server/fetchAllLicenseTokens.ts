import allLicenseTokensQuery from "../../graphql/allLicenseTokensQuery";
import { createAuthenticationToken } from "../device";
import { setLicenseTokens } from "../../stores/licenseTokensStore";

const fetchAllLicenseTokens = async (client: any, device: Olm.Account) => {
  const result = await client
    .query(
      allLicenseTokensQuery,
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

  if (result?.data?.allLicenseTokens) {
    setLicenseTokens(result.data.allLicenseTokens);
    // setLicenseTokens([
    //   {
    //     token: "absasdasdasd",
    //     isActive: true,
    //     subscriptionPlan: "PERSONAL_PRO",
    //   },
    // ]);
  } else {
    throw new Error("Failed to fetch the license tokens.");
  }
};

export default fetchAllLicenseTokens;
