import { GraphQLClient } from "graphql-request";
import config from '../config';
import { ORG_REPO_QUERY, REPO_PR_QUERY } from "./queries";
import { 
  ApiClient,
  RequestVariable,
  RepositoryResponse,
  PullRequestResponse 
} from './types';


const GITHUB_GQL_ENDPOINT = 'https://api.github.com/graphql';
const MAX_PER_PAGE = 100;

export class GitHubApi implements ApiClient<GraphQLClient>{
  constructor(
    public org: string,
    public perPage: number = MAX_PER_PAGE,
    public endpoint: string = GITHUB_GQL_ENDPOINT) {}
  
  public client = new GraphQLClient(this.endpoint, {
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  });

  get variables(): RequestVariable {
    return {
      org: this.org,
      perPage: this.perPage,
      afterCursor: null,
    }
  }

  public async requestRepositories(vars: RequestVariable): Promise<RepositoryResponse> {
    const response = await this.client.request(ORG_REPO_QUERY, vars)
    return response.organization;
  }

  public async requestPullRequests(repoName: string, vars = this.variables): Promise<PullRequestResponse> {
    vars = Object.assign({}, {...vars, repoName })
    const response = await this.client.request(REPO_PR_QUERY, vars);
    return response.repository.pullRequests;
  }

  public async fetchMore() {
    // fetchMore: reusable?
  }
}