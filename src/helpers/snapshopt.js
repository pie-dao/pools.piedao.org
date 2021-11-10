import moment from 'moment';
const PIEDAO_SNAPSHOT_SPACE = "piedao.eth";

export async function fetchLastMonthVoteForVoter(voter) {
  let lastMonth = moment().startOf('month').unix();
  let startingFrom = moment("2021-10-18").unix();

  // if the last month proposals are "younger" than the 18th of October 2021
  // then we use the 18th of October as a time limit to fetch the votes...
  let createdAt = lastMonth < startingFrom ? startingFrom : lastMonth;

  let graphqlQuery = `query {
    votes(
      first: 1,
      where: {
        space: "${PIEDAO_SNAPSHOT_SPACE}", 
        voter: "${voter}"
        created_gte: ${createdAt}
      }) {
      id
      ipfs
      voter
      created
      space {
        id
      }
      proposal {
        id
      }
      choice
      metadata
    }
  }`;

  try {
    let response = await executeQuery(graphqlQuery);
    return response.data.votes;    
  } catch(error) {
    return error;
  }
}

export async function fetchLastSnapshots(limit = 2, state = "", direction = "desc", fromDate = 0) {
  let graphqlQuery = `query {
    proposals(
      first: ${limit},
      skip: 0,
      where: {
        space: "${PIEDAO_SNAPSHOT_SPACE}",
        state: "${state}"
        start_gte: ${fromDate}
      },
      orderBy: "created",
      orderDirection: ${direction}
    ) {
      id
      state
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      link
    }
  }`;

  try {
    let response = await executeQuery(graphqlQuery);
    return response.data.proposals;
  } catch(error) {
    return error;
  }
} 

async function executeQuery(graphqlQuery) {
  try {
    let res = await fetch('https://hub.snapshot.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery
      })
    });
  
    let response = await res.json();
    return response;
  } catch(error) {
    return error;
  }
}