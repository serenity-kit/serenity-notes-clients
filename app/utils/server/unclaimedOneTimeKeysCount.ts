import unclaimedOneTimeKeysCountQuery from "../../graphql/unclaimedOneTimeKeysCount";
import createAuthenticationToken from "../createAuthenticationToken";

const unclaimedOneTimeKeysCount = async (
  client: any,
  device: Olm.Account,
  targetDeviceIdKey?: string
) => {
  const variables = targetDeviceIdKey ? { deviceIdKey: targetDeviceIdKey } : {};
  const result = await client
    .query(unclaimedOneTimeKeysCountQuery, variables, {
      fetchOptions: {
        headers: {
          authorization: `signed-utc-msg ${createAuthenticationToken(device)}`,
        },
      },
    })
    .toPromise();

  if (
    result?.data &&
    typeof result.data.unclaimedOneTimeKeysCount === "number"
  ) {
    return result.data.unclaimedOneTimeKeysCount;
  } else {
    // console.log("Failed to fetch unclaimedOneTimeKeysCountQuery");
    throw new Error("Failed to fetch unclaimedOneTimeKeysCountQuery");
  }
};

export default unclaimedOneTimeKeysCount;
