import moment from 'moment';

export async function fetchLastMonthVoteForVoter(voter) {
  let createdAt = moment().subtract(1, 'months').unix();

  let graphqlQuery = `query {
    votes(
      first: 1,
      where: {
        space: "piedao", 
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
        space: "piedao",
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