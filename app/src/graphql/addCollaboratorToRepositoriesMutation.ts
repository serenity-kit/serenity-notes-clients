export default `
mutation addCollaboratorToRepositories($input: AddCollaboratorToRepositoriesInput!) {
  addCollaboratorToRepositories(input: $input) {
    entries {
      repositoryId
      groupSessionMessageIds
    }
  }
}`;
