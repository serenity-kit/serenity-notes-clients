export default `
query repositoriesQuery($lastContentUpdateIntegrityIdsByRepository: [LastContentUpdateIntegrityIdByRepository!]) {
  allRepositories(lastContentUpdateIntegrityIdsByRepository: $lastContentUpdateIntegrityIdsByRepository) {
    __typename
    ... on Repository {
      id
      lastContentUpdateIntegrityId
      content {
        id
        encryptedContent
        groupSessionMessage {
          type
          body
          targetDeviceIdKey
        }
        createdAt
        authorUserId
        authorDevice {
          idKey
          signingKey
          signatures
        }
      }
      collaborators {
        id
      }
      isCreator
    }
    ... on RepositoryTombstone {
      id
    }
  }
}
`;
