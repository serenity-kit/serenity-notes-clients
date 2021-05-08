export default `
mutation sendOneTimeKeys($input: SendOneTimeKeysInput!) {
  sendOneTimeKeys(input: $input) {
    device {
      id
      oneTimeKeys {
        key
      }
    }
  }
}`;
