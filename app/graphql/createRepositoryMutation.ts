export default `
mutation createRepositoryMutation($input: CreateRepositoryInput!) {
  createRepository(input: $input) {
    repository {
      id
      collaborators {
        id
        devices {
          idKey
          signingKey
        }
      }
      isCreator
    }
    groupSessionMessageIds
  }
}
`;
