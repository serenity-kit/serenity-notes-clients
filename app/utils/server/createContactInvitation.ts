import createContactInvitationMutation from "../../graphql/createContactInvitationMutation";
import { createAuthenticationToken } from "../device";

const createContactInvitation = async (
  client: any,
  device: Olm.Account,
  serverSecret: string
) => {
  const result = await client
    .mutation(
      createContactInvitationMutation,
      { input: { serverSecret } },
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

  if (result?.data?.createContactInvitation?.contactInvitation?.id) {
    return result.data.createContactInvitation.contactInvitation.id;
  } else {
    throw new Error("Failed to create contact invitation.");
  }
};

export default createContactInvitation;
