require('dotenv').config()
// import { makeRepoRequest } from '@/api/http';
import { BulkPullRequest } from './loaders/BulkPullRequest';
import { JsonReport } from './reportTargets/JsonReport';

async function main() {
  // makeRepoRequest(); brute force solution; ignore :)
  
  /*
    load the pull requests
  */
  const ramdaPullRequestLoader = await BulkPullRequest.forOrg('ramda');
  await ramdaPullRequestLoader.load()

  /* 
    the results to do stuff with
  */
  const prResults = ramdaPullRequestLoader.data;


  /*
  Added the below for debugging purposes to avoid rate-limiting
  I considered caching, but my solution is a script and not an express app; we can always convert to an express app if needed?
  */
  const stats = prResults.map(r => ({ title: r.name, totalPrs: r.pullRequests.length }))

  JsonReport.generate({ filename: 'debug_pr_stats', data: stats });
}

main();
