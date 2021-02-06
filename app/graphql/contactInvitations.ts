export default `
query contactInvitations {
  contactInvitations {
    id
    status
    contactInfoMessage
    acceptedByUserId
  }
}`;
