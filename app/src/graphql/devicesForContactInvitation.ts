export default `
query devicesForContactInvitation($userId: ID!, $userSigningKey: String!, $serverSecret: String!) {
  devicesForContactInvitation(userId: $userId, userSigningKey: $userSigningKey, serverSecret: $serverSecret) {
    id
    idKey
    signingKey
    signatures
  }
}`;
