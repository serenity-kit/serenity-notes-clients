import deleteRepositoryMutation from "../../graphql/deleteRepositoryMutation";
import { createAuthenticationToken } from "../device";

const deleteRepository = async (
  client: any,
  repositoryId: string,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      deleteRepositoryMutation,
      {
        input: {
          repositoryId,
        },
      },
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

  if (result?.data?.deleteRepository?.success) {
    return true;
  } else {
    throw new Error("Failed to delete the repository.");
  }
};

export default deleteRepository;
