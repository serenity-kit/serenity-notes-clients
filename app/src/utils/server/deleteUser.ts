import deleteUserMutation from "../../graphql/deleteUserMutation";
import { createAuthenticationToken } from "../device";

const deleteUser = async (client: any, device: Olm.Account) => {
  const result = await client
    .mutation(
      deleteUserMutation,
      { input: {} },
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

  if (result?.data?.deleteUser?.success) {
    return true;
  } else {
    throw new Error("Failed to delete the user.");
  }
};

export default deleteUser;
