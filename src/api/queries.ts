import { gql } from 'graphql-request';

const PAGE_INFO_FRAGMENT = gql`
  pageInfo {
    hasNextPage
    endCursor 
  }
`;

export const ORG_REPO_QUERY = gql`
  query (
    $org: String!,
    $perPage: Int!,
    $afterCursor: String) {
    organization(login: $org) {
      repositories(first: $perPage, after: $afterCursor) {
        ${PAGE_INFO_FRAGMENT}
        nodes {
          id
          name
        }
      }
    }
  }
`

export const REPO_PR_QUERY = gql`
  query (
    $org: String!,
    $repoName: String!,
    $perPage: Int!,
    $afterCursor: String) {
    repository(name: $repoName, owner: $org) {
      pullRequests(first: $perPage, after: $afterCursor) {
      ${PAGE_INFO_FRAGMENT}
      nodes {
        id
        title
        }
      } 
    }
  }
`