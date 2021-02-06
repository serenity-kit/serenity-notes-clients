export default `
mutation acceptContactInvitation($input: AcceptContactInvitationInput!) {
  acceptContactInvitation(input: $input) {
    contactInvitation {
      id
    }
  }
}`;
