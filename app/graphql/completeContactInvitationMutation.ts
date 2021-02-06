export default `
mutation completeContactInvitation($input: CompleteContactInvitationInput!) {
  completeContactInvitation(input: $input) {
    contactInvitation {
      id
      status
    }
  }
}`;
