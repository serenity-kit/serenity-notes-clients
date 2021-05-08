import removeCollaboratorFromRepositoryMutation from "../../graphql/removeCollaboratorFromRepositoryMutation";
import { createAuthenticationToken } from "../device";

const removeCollaboratorFromRepository = async (
  client: any,
  repositoryId: string,
  collaboratorId: string,
  device: Olm.Account
) => {
  const result = await client
    .mutation(
      removeCollaboratorFromRepositoryMutation,
      {
        input: {
          repositoryId,
          collaboratorId,
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

  if (result?.data?.removeCollaboratorFromRepository?.repository?.id) {
    return true;
  } else {
    throw new Error("Failed to remove the collaborator from the repository.");
  }
};

export default removeCollaboratorFromRepository;
