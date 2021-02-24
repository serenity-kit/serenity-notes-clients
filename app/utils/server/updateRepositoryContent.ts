import { createAuthenticationToken } from "../device";
import updateRepositoryContentMutation from "../../graphql/updateRepositoryContentMutation";

const updateRepositoryContent = async (client: any, device: Olm.Account) => {
  const result = await client
    .mutation(
      updateRepositoryContentMutation,
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

export default updateRepositoryContent;
