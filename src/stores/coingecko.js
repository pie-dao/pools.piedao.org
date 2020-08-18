import { writable } from 'svelte/store';
import poolsConfig from '../config/pools.json';

const store = writable({});

export const piesMarketDataStore = store;

async function request(uri, params = {}, method = 'GET') {
  let url = uri;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (params) {
    if (method === 'GET') {
      url += `?${objectToQueryString(params)}`;
    } else {
      options.body = JSON.stringify(params);
    }
  }
  const response = await fetch(url, options);

  if (response.status !== 200) {
    console.error('The server responded with an unexpected status.', response.status);
    return response.status;
  }

  const result = await response.json();
  // console.log('piesMarketDataStore', result)

  return result;
}

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join('&');
}

export class CoinGecko {
  static async sync() {
    await CoinGecko.fetchPiesDataAndUnderlying();
  }

  static async fetchPiesDataAndUnderlying() {
    const tokens = [];
    poolsConfig.available.forEach((pieAddress) => {
      if (poolsConfig[pieAddress].coingeckoId) {
        tokens.push(poolsConfig[pieAddress].coingeckoId);
      }

      poolsConfig[pieAddress].composition.forEach((t) => {
        if (t.coingeckoId !== undefined) tokens.push(t.coingeckoId);
      });
    });

    const res = await Promise.all(tokens.map((n) => CoinGecko.fetchCoinData(n)));
    store.update((currentState) => {
      const newState = { ...currentState };
      res.forEach((data) => {
        newState[data.contract_address] = data;
      });
      return newState;
    });
  }

  static fetchCoinData(coingeckoID) {
    const baseURL = 'https://api.coingecko.com/api/v3';
    return request(`${baseURL}/coins/${coingeckoID}`);
  }
}
