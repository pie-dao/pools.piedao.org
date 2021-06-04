import { ethers } from 'ethers';
import { get } from 'svelte/store';
import { pieSmartPool } from '@pie-dao/abis';

import pools from '../../config/pools.json';

import { eth } from './writables.js';

const etherscanApiKey = '67NWT4RN7W1TQ9NX4MIY1MCAIW52NK26SC';

const findProxyAddressFunc = (abi) => {
  if (isPie(abi)) {
    return 'getImplementation';
  } if (hasImplementation(abi)) {
    return 'implementation';
  }

  return false;
};

const hasImplementation = (abi) => abi.filter(({ name }) => name === 'implementation').length > 0;

const isPie = (abi) => abi.filter(({ name }) => name === 'getImplementation').length > 0;

/* eslint-disable consistent-return */
const loadAbi = (addy) => {
  const address = addy.toLowerCase();
  try {
    if (pools.available.includes(address)) {
      return pieSmartPool;
    }

    const abi = window.localStorage.getItem(`abis.${address}`);
    if (abi) {
      return JSON.parse(abi);
    }
  } catch (e) {
    console.warn('Error parsing stored abi for address', address, e);
    window.localStorage.removeItem(`abis.${address}`);
  }
};
/* eslint-enable consistent-return */

const storeAbi = (addy, abi) => {
  const address = addy.toLowerCase();
  try {
    const json = JSON.stringify(abi);
    window.localStorage.setItem(`abis.${address}`, json);
  } catch (e) {
    console.warn('Unable to store abi for address', address, e);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const findAbi = async (address) => {
  const existing = loadAbi(address);

  if (existing) {
    return existing;
  }

  let response = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apiKey=${etherscanApiKey}`,
  );
  let decoded = await response.json();
  const abi = JSON.parse(decoded.result);

  const proxyAddressFunc = findProxyAddressFunc(abi);

  if (proxyAddressFunc) {
    // Proxy
    const { provider } = get(eth);
    console.log('proxyAddressFunc', proxyAddressFunc);
    const contract = new ethers.Contract(address, abi, provider);
    const proxy = await contract[proxyAddressFunc]();

    response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${proxy}&apiKey=${etherscanApiKey}`,
    );
    decoded = await response.json();
    const proxyAbi = JSON.parse(decoded.result);
    proxyAbi.forEach((item) => abi.push(item));
  }

  storeAbi(address, abi);

  return abi;
};
