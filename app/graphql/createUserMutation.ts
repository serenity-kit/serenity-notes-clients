export default `
mutation createUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user {
      id
      devices {
        idKey
        signingKey
      }
    }
  }
}`;
