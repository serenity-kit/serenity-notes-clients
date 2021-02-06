export default `
query fetchAddDeviceVerification($deviceIdKey: String!, $serverSecret: String!) {
  fetchAddDeviceVerification(deviceIdKey: $deviceIdKey, serverSecret: $serverSecret) {
    verificationMessage
  }
}`;
