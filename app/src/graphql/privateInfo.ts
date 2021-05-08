export default `
query {
  privateInfo {
    privateInfoContent {
      encryptedContent
      privateInfoGroupSessionMessage {
        id
        type
        body
        targetDeviceIdKey
      }
      authorDevice {
        idKey
        signingKey
        signatures
      }
    }
  }
}`;
