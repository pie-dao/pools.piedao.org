import BigNumber from 'bignumber.js';
import WalletConnectProvider from '@walletconnect/web3-provider/dist/cjs/index';

import { erc20 } from '@pie-dao/abis';
import { ethers } from 'ethers';
import { get } from 'svelte/store';

import displayNotification from '../notifications';

import { allowances, eth } from './eth/writables.js';
import { functionKey } from './eth/keys.js';
import { observableContract } from './eth/contracts.js';
/* eslint-disable import/no-cycle */
import { registerConnection, resetConnection } from './eth/connection.js';
/* eslint-enable import/no-cycle */
import { subject } from './eth/observables.js';
import { trackEthBalance } from './eth/lifecycle.js';

export { allowances, balances, eth, pools } from './eth/writables.js';
export { balanceKey, functionKey } from './eth/keys.js';
export { bumpLifecycle } from './eth/lifecycle.js';
export { subject } from './eth/observables.js';

const Web3Modal = window.Web3Modal.default;
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        1: 'http://localhost:8545',
      },
      // infuraId:
      //   'e106b2b27c0f4941be1f2c183a20b3ea', // production key
      //   // '1ec103a49691457aa6dff30aa8ab73d0', // testing key
    },
  },
  injected: {
    package: null,
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

// CONNECTION MANAGEMENT

export const isChachedProvider = () => {
  console.log('web3Button -> isChachedProvider', web3Modal.cachedProvider);
  return web3Modal.cachedProvider;
};

export const clearChachedProvider = () => {
  web3Modal.clearCachedProvider();
};

// DEPRECATED FUNCTION
export const connectWeb3Cached = async () => {
  try {
    resetConnection();

    const web3 = await web3Modal.connectTo('injected');

    if (!web3) {
      console.log('NOT CONNECTED');
      return;
    }

    console.log('CONNECTED', web3);

    registerConnection(web3);
  } catch (e) {
    console.error('ERROR CONNECTION TO WEB3', e);
    resetConnection();
  }
};

export const connectWeb3 = async () => {
  try {
    resetConnection();

    const web3 = await web3Modal.connect();

    if (!web3) {
      console.log('NOT CONNECTED');
      return;
    }

    console.log('CONNECTED', web3);
    registerConnection(web3);
  } catch (e) {
    console.error('ERROR CONNECTION TO WEB3', e);
    resetConnection();
  }
};

// SUBSPACE(ISH)

export const contract = ({ abi, address }) => observableContract({ abi, address }); // async
export const trackBalance = async (address, tokenAddress) => {
  const ethData = get(eth);
  let walletAddress = address;

  if (!walletAddress) {
    if (!ethData.address) {
      throw new Error(
        'stores/eth#trackBalance - an wallet must be connected or a wallet address passed as the first argument',
      );
    }
    walletAddress = ethData.address;
  }

  if (tokenAddress && tokenAddress !== ethers.constants.AddressZero) {
    const tokenContract = await contract({ abi: erc20, address: tokenAddress });
    return tokenContract.trackBalance(walletAddress);
  }

  return trackEthBalance(walletAddress);
};
export const trackBlock = async () => subject('block');
export const trackBlockNumber = async () => subject('blockNumber');
export const trackGasPrice = async () => subject('gasPrice');

// Shortcuts

export const approve = async (address, spender, amount, overrides = {}) => {
  const erc20Contract = await contract({ address, abi: erc20 });
  const { hash } = await erc20Contract['approve(address,uint256)'](spender, amount, overrides);

  const { emitter } = displayNotification({ hash });
  const symbol = await erc20Contract.symbol();
  let currentBlockNumber;

  await new Promise((resolve) =>
    emitter.on('txConfirmed', ({ blockNumber }) => {
      currentBlockNumber = blockNumber;
      resolve();
      return { message: `${symbol} unlocked`, type: 'success' };
    }),
  );

  const decimals = await erc20Contract.decimals();
  const updates = {};
  const args = [get(eth).address, spender];
  const key = functionKey(address, 'allowance', args);

  updates[key] = BigNumber(amount.toString()).dividedBy(10 ** decimals);
  console.log('update allowances', updates[key].toString(), { ...get(allowances), ...updates });
  allowances.set({ ...get(allowances), ...updates });
  const lastBlock = get(eth).currentBlockNumber;
  if (currentBlockNumber > lastBlock) {
    eth.set({ ...get(eth), currentBlockNumber });
  }

  return true;
};

// eslint-disable-next-line max-len
export const approveMax = async (address, spender, overrides = {}) =>
  approve(address, spender, ethers.constants.MaxUint256, overrides);
