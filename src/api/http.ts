import config from '../config';
import { GraphQLClient } from 'graphql-request';
import { ORG_REPO_QUERY, REPO_PR_QUERY } from './queries';
import { writeFileSync } from 'fs';

/* 
  Needed to learn my way around the github GQL api
  This is a BRUTE FORCE SOLUTION; not organized or reusable at all!!!
*/

const MAX_PER_PAGE = 100;
const endpoint = 'https://api.github.com/graphql';
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Authorization': `Bearer ${config.token}`
  }
})

const RESULTS: any[] = [];

export async function makeRepoRequest(vars?: any) {
  // get all the repos
  const variables = { org: 'ramda', perPage: MAX_PER_PAGE, afterCursor: null }
  const repoResponse = await graphQLClient.request(ORG_REPO_QUERY, variables);
  // call the callback function to process the data
  if (repoResponse.organization.repositories.pageInfo.hasNextPage) {
    // make another request and pass the endCursor argument to the after argument
    makeRepoRequest({ org: 'ramda', perPage: 100, afterCursor: repoResponse.organization.repositories.pageInfo.endCursor })
  }
  processRepos(repoResponse);

  try {
    makeRequestForPullReqs(RESULTS);
  } catch (e) {
    throw new Error(e.stack)
  }
}

async function makeQuery(query: any, variables: any): Promise<any> {
  return await graphQLClient.request(query, variables)

}

const processRepos = (data: any) => {
  return data.organization.repositories.nodes.forEach((n: any) => {
    RESULTS.push(n);
  })
}

export async function makeRequestForPullReqs(results: any[]) {
  let cursor = null;
  let hasNextPage = true;
  let allResults = results;
  let apiResponse;

  // add pull request array
  allResults = allResults.map(r => {
    return {...r, pullRequests: [] }
  });

  for (let i = 0; i < allResults.length; i++) {
    let baseVariables = { org: 'ramda', repoName: allResults[i].name, perPage: MAX_PER_PAGE }
    console.log(`Loading pull requests for the ${allResults[i].name} repository...`)
    
    // get the next results of PRs
    while(hasNextPage) {
      apiResponse = await makeQuery(REPO_PR_QUERY, {
        ...baseVariables,
        afterCursor: cursor
      })
      
      allResults[i].pullRequests.push(...apiResponse.repository.pullRequests.nodes);
      cursor = apiResponse.repository.pullRequests.pageInfo.endCursor;
      hasNextPage = apiResponse.repository.pullRequests.pageInfo.hasNextPage;
    }
    // reset the variables for the next repo in the array
    hasNextPage = true;
    cursor = null
  }

  writeFileSync('./data.json', JSON.stringify(allResults, undefined, 2))
  const stats = allResults.map(r => ({ title: r.name, totalPrs: r.pullRequests.length }))
  writeFileSync('./stats.json', JSON.stringify(stats, undefined, 2))
}