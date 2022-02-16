import jazzicon from 'jazzicon';

import { ethers } from 'ethers';
import { get } from 'svelte/store';
import { shortenAddress } from '@pie-dao/utils';
import { initialize } from '../../helpers/staking.js';
import { defaultEth, eth } from './writables.js';
/* eslint-disable import/no-cycle */
import { connectWeb3, clearChachedProvider } from '../eth.js';
/* eslint-enable import/no-cycle */
import { bumpLifecycle, updateCurrentBlock } from './lifecycle.js';
import { resetContractCache } from './contracts.js';
import env from '../../config/env.json';
// whenever networkId == 1, we expect to be no production/mainnet environment,
// otherwhise, we setup a rinkeby proider as defaultProvider...
// export const defaultProvider = env.blocknative.networkId === 1
//   ? new ethers.providers.InfuraProvider(
//     'homestead',
//     'e106b2b27c0f4941be1f2c183a20b3ea', // production key
//     // '1ec103a49691457aa6dff30aa8ab73d0' // testing key
//   )
//   : new ethers.providers.JsonRpcProvider('https://eth-rinkeby.alchemyapi.io/v2/xFSk4OZFkMNAlp1Pa2f3V-7kdifh5_p5');

export const defaultProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

defaultProvider.on('block', updateCurrentBlock);

eth.set({ ...get(eth), provider: defaultProvider });

const resetWeb3Listeners = () => {
  const { provider, web3 } = get(eth);

  if (provider) {
    provider.off('block', updateCurrentBlock);
    defaultProvider.on('block', updateCurrentBlock);
  }

  /* eslint-disable no-undef */
  if (web3 && web3.off) {
    console.log('web', web3);
    web3.off('accountsChanged', connectWeb3);
    web3.off('chainChanged', resetWeb3);
    web3.off('disconnect', resetWeb3);
  }
  /* eslint-enable no-undef */
};

const setWeb3Listeners = () => {
  const { provider, web3 } = get(eth);

  if (provider) {
    defaultProvider.off('block', updateCurrentBlock);
    provider.on('block', updateCurrentBlock);
  }

  if (web3) {
    web3.on('accountsChanged', () => registerConnection());
    web3.on('chainChanged', resetConnection);
    web3.on('disconnect', resetConnection);
  }
};

export const registerConnection = async (newWeb3) => {
  const web3 = newWeb3 || get(eth).web3;
  console.log('newWeb3', newWeb3);

  if (!web3) {
    throw new Error('Unable to find a web3 object. Was one passed?');
  }

  const provider = new ethers.providers.Web3Provider(web3);
  const signer = provider.getSigner();

  const [currentBlockNumber, network, address] = await Promise.all([
    provider.getBlockNumber(),
    provider.getNetwork(),
    signer.getAddress(),
  ]);

  window.localStorage.setItem('address', address);

  const shortAddress = shortenAddress(address);
  let icon;
  try {
    icon = jazzicon(16, parseInt(address.slice(2, 10), 16)).outerHTML;
  } catch (e) {
    icon = '';
  }

  /* const ens = await provider.lookupAddress(address); */

  eth.set({
    address,
    /* ens, */
    currentBlockNumber,
    icon,
    network,
    provider,
    shortAddress,
    signer,
    web3,
  });

  setWeb3Listeners();
  bumpLifecycle();

  // initialize the stakingData store object...
  await initialize(get(eth));
};

export const resetConnection = () => {
  resetWeb3Listeners();
  resetContractCache();
  eth.set({ ...defaultEth, provider: defaultProvider });
};
