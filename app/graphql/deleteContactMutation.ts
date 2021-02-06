export default `
mutation deleteContact($input: DeleteContactInput!) {
  deleteContact(input: $input) {
    success
  }
}`;
