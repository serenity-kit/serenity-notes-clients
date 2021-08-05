import removeOneTimeKeyMutation from "../../graphql/removeOneTimeKeyMutation";
import { addOneTimeKey } from "../../stores/oneTimeKeysFailedToRemoveFromServerStore";
import createAuthenticationToken from "../createAuthenticationToken";

const removeOneTimeKey = async (
  client: any,
  device: Olm.Account,
  oneTimeKey: string
) => {
  try {
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
      throw new Error("Failed to remove one-time key");
    }
  } catch (err) {
    // not necessary to wait for it
    addOneTimeKey(oneTimeKey);
  }
};

export default removeOneTimeKey;
