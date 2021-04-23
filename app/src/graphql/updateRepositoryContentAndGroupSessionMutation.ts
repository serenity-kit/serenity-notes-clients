export default `
mutation updateRepositoryContentAndGroupSessionMutation($input: UpdateRepositoryContentAndGroupSessionInput!) {
  updateRepositoryContentAndGroupSession(input: $input) {
    content {
      encryptedContent
    }
    groupSessionMessageIds
  }
}
`;
