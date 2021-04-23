import deleteContactMutation from "../../graphql/deleteContactMutation";
import { createAuthenticationToken } from "../device";

const deleteContact = async (
  client: any,
  contactId: string,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      deleteContactMutation,
      { input: { contactId } },
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

  if (result?.data?.deleteContact?.success) {
    return true;
  } else {
    throw new Error("Failed to delete the contact.");
  }
};

export default deleteContact;
