import deleteContactInvitationMutation from "../../graphql/deleteContactInvitationMutation";
import { createAuthenticationToken } from "../device";

const deleteContactInvitation = async (
  client: any,
  contactInvitationId: string,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      deleteContactInvitationMutation,
      { input: { contactInvitationId } },
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

  if (result?.data?.deleteContactInvitation?.success) {
    return true;
  } else {
    throw new Error("Failed to delete the contact invitation.");
  }
};

export default deleteContactInvitation;
