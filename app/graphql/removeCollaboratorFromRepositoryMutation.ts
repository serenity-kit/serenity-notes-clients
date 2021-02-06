export default `
mutation removeCollaboratorFromRepository($input: RemoveCollaboratorFromRepositoryInput!) {
  removeCollaboratorFromRepository(input: $input) {
    repository {
      id
    }
  }
}
`;
