export default `
mutation addContact($input: AddContactInput!) {
  addContact(input: $input) {
    success
  }
}`;
