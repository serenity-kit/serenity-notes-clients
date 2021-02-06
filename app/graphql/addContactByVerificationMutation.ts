export default `
mutation addContactByVerification($input: AddContactByVerificationInput!) {
  addContactByVerification(input: $input) {
    success
  }
}`;
