export default `
mutation addDevice($input: AddDeviceInput!) {
  addDevice(input: $input) {
    success
  }
}`;
