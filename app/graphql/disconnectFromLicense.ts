export default `
mutation disconnectFromLicense($input: DisconnectFromLicenseInput!) {
  disconnectFromLicense(input: $input) {
    success
  }
}`;
