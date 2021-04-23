import removeOneTimeKeyMutation from "../../graphql/removeOneTimeKeyMutation";
import createAuthenticationToken from "../createAuthenticationToken";

const removeOneTimeKey = async (
  client: any,
  device: Olm.Account,
  oneTimeKey: string
) => {
  const result = await client
    .mutation(
      removeOneTimeKeyMutation,
      { input: { key: oneTimeKey } },
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

  if (!result?.data?.removeOneTimeKey?.success) {
    throw new Error("Failed to remove onetimekey");
  }
};

export default removeOneTimeKey;
