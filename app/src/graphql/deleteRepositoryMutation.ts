export default `
mutation deleteRepository($input: DeleteRepositoryInput!) {
  deleteRepository(input: $input) {
    success
  }
}
`;
