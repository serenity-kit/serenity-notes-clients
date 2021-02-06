export default `
query unclaimedOneTimeKeysCount($deviceIdKey: String) {
  unclaimedOneTimeKeysCount(deviceIdKey: $deviceIdKey)
}
`;
