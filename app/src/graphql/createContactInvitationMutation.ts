export default `
mutation createContactInvitation($input: CreateContactInvitationInput!) {
  createContactInvitation(input: $input) {
    contactInvitation {
      id
    }
  }
}`;
