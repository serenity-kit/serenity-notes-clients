export default `
mutation deleteContactInvitation($input: DeleteContactInvitationInput!) {
  deleteContactInvitation(input: $input) {
    success
  }
}`;
