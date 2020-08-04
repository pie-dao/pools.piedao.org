import { writable } from "svelte/store";
import poolsConfig from "../config/pools.json";

const store = writable({

});

export const piesMarketDataStore = store;

console.log('piesMarketDataStore', piesMarketDataStore)

async function request(url, params = {}, method = 'GET') {

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (params) {
    if (method === 'GET') {
      url += '?' + objectToQueryString(params);
    } else {
      options.body = JSON.stringify(params);
    }
  }
  const response = await fetch(url, options);

  if (response.status !== 200) {
    return generateErrorResponse('The server responded with an unexpected status.');
  }

  const result = await response.json();

  return result;

}

function objectToQueryString(obj) {
  return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

export class CoinGecko {

  static baseURL = 'https://api.coingecko.com/api/v3';

  static async sync() {
    await CoinGecko.fetchPiesDataAndUnderlying();
  }

  static async fetchPiesDataAndUnderlying() {
    const tokens = [];
    poolsConfig.available.forEach(pieAddress => {
      if (poolsConfig[pieAddress].coingeckoId !== undefined) tokens.push(poolsConfig[pieAddress].coingeckoId);
      poolsConfig[pieAddress].composition.forEach(t => {
        if (t.coingeckoId !== undefined) tokens.push(t.coingeckoId);
      });
    });


    const res = await Promise.all(tokens.map(n => CoinGecko.fetchCoinData(n)));
    store.update(state => {
      res.forEach(data => {
        state[data.contract_address] = data;
      });
      return state;
    });
  }



  static fetchCoinData(coingeckoID) {
    return request(`${CoinGecko.baseURL}/coins/${coingeckoID}`);
  }
}


export const defaultCoingecko = {
  list: []
};
