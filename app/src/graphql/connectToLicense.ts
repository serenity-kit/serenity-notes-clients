export default `
mutation connectToLicense($input: ConnectToLicenseInput!) {
  connectToLicense(input: $input) {
    licenseToken
  }
}`;
