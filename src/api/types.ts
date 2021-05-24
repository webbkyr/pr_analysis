export interface ApiClient<T> {
  perPage: number;
  endpoint: string;
  client: T;
}
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: null | string;
}

export interface Organization {
  repositories: Repository;
}

export interface Repository {
  id: string;
  name: string;
}

export interface PullRequest {
  id: string;
  title: string;
}

export interface Loader<T> {
  data: T[]; 
  load(): void;
  // todo?
  // fetchMore(next: boolean): void;
}

export interface RequestVariable {
  org?: string;
  repoName?: string;
  perPage: number;
  afterCursor: null | string;
}

export interface RepositoryResponse {
  repositories: {
    nodes: Repository[],
    pageInfo: PageInfo
  }
}

export interface PullRequestResponse {
  nodes: PullRequest[],
  pageInfo: PageInfo
}