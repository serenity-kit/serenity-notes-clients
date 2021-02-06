export default `
mutation deleteUser($input: DeleteUserInput!) {
  deleteUser(input: $input) {
    success
  }
}
`;
