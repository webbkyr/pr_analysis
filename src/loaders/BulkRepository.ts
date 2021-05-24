import { GitHubApi } from '../api/GithubApi';
import { Loader, Repository } from '../api/types';

export class BulkRepository implements Loader<Repository>{
  constructor(public orgName: string, public api: GitHubApi) {}
  public data: Repository[] = [];
  
  static forOrg(name: string) {
    return new BulkRepository(name, new GitHubApi(name))
  }

  async load(): Promise<void> {
    try {
      const data = await this.api.requestRepositories(this.api.variables)
      data.repositories.nodes.forEach(n => this.data.push(n));
    } catch (e) {
      throw new Error(e.stack);
    }
  }

  // todo add fetchMore logic for repositories
}