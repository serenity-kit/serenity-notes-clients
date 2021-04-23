export default `
mutation claimOneTimeKeysForMultipleDevices($input: ClaimOneTimeKeysForMultipleDevicesInput!) {
  claimOneTimeKeysForMultipleDevices(input: $input) {
    oneTimeKeysWithDeviceIdKey {
      oneTimeKey {
        key
        signature
      }
      deviceIdKey
    }
  }
}`;
