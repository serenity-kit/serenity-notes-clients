export default `
query contacts {
  contacts {
    id
    contactSigningKey
    signatures
    contactUserId
  }
}`;
