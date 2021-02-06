export default `
query repositoryDevicesQuery($repositoryId: ID!, $groupSessionMessageIds: [ID!]!) {
  repositoryDevices(repositoryId: $repositoryId, groupSessionMessageIds: $groupSessionMessageIds) {
    devices {
      idKey
      signingKey
      signatures
      userId
    }
    groupSessionMessageIdsMatchTargetDevices
  }
}
`;
