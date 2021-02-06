export default `
mutation deleteDevice($input: DeleteDeviceInput!) {
  deleteDevice(input: $input) {
    success
  }
}
`;
