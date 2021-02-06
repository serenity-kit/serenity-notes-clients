export default `
mutation updateRepositoryContentMutation($input: UpdateRepositoryContentInput!) {
  updateRepositoryContent(input: $input) {
    content {
      encryptedContent
    }
  }
}
`;
