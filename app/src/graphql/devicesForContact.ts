export default `
query devicesForContact($contactId: ID!) {
  devicesForContact(contactId: $contactId) {
    id
    idKey
    signingKey
    signatures
  }
}`;
