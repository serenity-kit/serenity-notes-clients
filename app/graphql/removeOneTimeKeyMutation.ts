export default `
mutation removeOneTimeKey($input: RemoveOneTimeKeyInput!) {
  removeOneTimeKey(input: $input) {
    success
  }
}`;
