/* eslint-disable no-param-reassign */
/* eslint-disable comma-dangle */
import * as _jsonToGraphQLQuery from 'json-to-graphql-query';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import queries from './queries.json';

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
const { jsonToGraphQLQuery } = _jsonToGraphQLQuery.default;

export async function request(key, _jsonQuery) {
  const jsonQuery = key ? merge(cloneDeep(queries[key]), cloneDeep(_jsonQuery)) : _jsonQuery;

  const query = typeof jsonQuery === 'string' ? jsonQuery : jsonToGraphQLQuery({ query: jsonQuery });

  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  try {
    const { data } = await res.json();
    return data;
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function subgraphRequest(url, query) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) }),
  });
  const { data } = await res.json();
  return data || {};
}

export function formatPool(pool) {
  pool.tokens = pool.tokens.map((token) => {
    token.weightPercent = (100 / pool.totalWeight) * token.denormWeight;
    return token;
  });
  if (pool.shares) pool.holders = pool.shares.length;
  // pool.tokensList = pool.tokensList.map((token) => getAddress(token));
  pool.lastSwapVolume = 0;
  const poolTotalSwapVolume = pool.swaps && pool.swaps[0] && pool.swaps[0].poolTotalSwapVolume
    ? parseFloat(pool.swaps[0].poolTotalSwapVolume)
    : 0;
  pool.lastSwapVolume = parseFloat(pool.totalSwapVolume) - poolTotalSwapVolume;
  return pool;
}

export async function getSubgraphMetadata(address) {
  const swapTsStart = Math.round(new Date().getTime() / 1000) - 24 * 3600;
  const query = {
    pool: {
      __args: {
        id: address,
      },
      swaps: {
        __args: {
          where: {
            timestamp_lt: swapTsStart,
          },
        },
      },
    },
  };
  try {
    const response = await subgraphRequest(subgraphUrl, merge(queries.getPool, query));
    return formatPool(response.pool);
  } catch (e) {
    console.error(e);
  }
}

export async function getPoolSwaps(address) {
  const query = {
    swaps: {
      __args: {
        orderBy: 'timestamp',
        orderDirection: 'desc',
        where: {
          poolAddress: address.toLowerCase(),
        },
      },
    },
  };

  const { swaps } = await request('getPoolSwaps', query);
  return swaps;
}

export async function getPoolMetrics(address) {
  try {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const today = now - (now % day);
    const query = {};
    for (let i = 0; i < 31; i++) {
      const timestamp = today - i * day;
      query[`metrics_${timestamp}`] = {
        __aliasFor: 'swaps',
        __args: {
          first: 1,
          orderBy: 'timestamp',
          orderDirection: 'desc',
          where: {
            poolAddress: address,
            timestamp_gt: timestamp / 1000,
            timestamp_lt: (timestamp + day) / 1000,
          },
        },
        poolTotalSwapVolume: true,
        poolTotalSwapFee: true,
        poolLiquidity: true,
      };
    }
    return await request('getPoolMetrics', query);
  } catch (e) {
    console.log('e', e);
  }
}
