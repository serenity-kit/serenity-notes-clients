export default `
mutation updatePrivateInfo($input: UpdatePrivateInfoInput!) {
  updatePrivateInfo(input: $input) {
    privateInfoContent {
      encryptedContent
    }
  }
}`;
