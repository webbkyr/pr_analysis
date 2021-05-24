import { ConsoleReport } from "../reportTargets/ConsoleReport";
import { GitHubApi } from "../api/GithubApi";
import { Loader, PullRequest, Repository } from '../api/types';
import { BulkRepository } from "./BulkRepository";

type ConsolidatedRepo = Repository & { pullRequests: PullRequest[] }

export class BulkPullRequest implements Loader<ConsolidatedRepo>{
  constructor(
    private repos: Repository[],
    private api: GitHubApi) {
    this.data = this.repos.map(r => {
      return {...r, pullRequests: [] }
    })
  }

  public data: ConsolidatedRepo[];

  static async forOrg(owner: string) {
    const repoLoader = BulkRepository.forOrg(owner);
    await repoLoader.load();
    return new BulkPullRequest(repoLoader.data, new GitHubApi(owner))
  }

  async load(): Promise<void> {
    let cursor: null | string = null;
    let hasNextPage = true;
    let pullRequests;
    
    // TODO: this is kinda slow. optimize? cut the arr in half; 
    // We can get data in parallel
    for (let i = 0; i < this.data.length; i++) {
      const repoName = this.data[i].name
      this.print(`Loading pull requests for the ${repoName} repository...`)
      
      while (hasNextPage) {
        try {
          pullRequests = await this.api.requestPullRequests(
            repoName,
            {...this.api.variables, afterCursor: cursor }
          )
        } catch (e) {
          throw new Error(e.stack)
        }
                
        this.data[i].pullRequests.push(...pullRequests.nodes)
        
        this.print(`Added ${pullRequests.nodes.length} PRs to ${repoName}`)
        
        cursor = pullRequests.pageInfo.endCursor;
        hasNextPage = pullRequests.pageInfo.hasNextPage;
      }
      // reset the variables for the next repo in the array
      hasNextPage = true;
      cursor = null
    }
    this.print('!!!DONE!!!')
  }

  async print(message: string) {
    return new ConsoleReport().print(message);
  }
}