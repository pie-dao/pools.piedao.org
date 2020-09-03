import BigNumber from 'bignumber.js';

import { ethers } from 'ethers';
import { get } from 'svelte/store';
import { isBigNumber, isNumber, validateIsAddress, validateIsBigNumber } from '@pie-dao/utils';

import images from '../config/images.json';
import poolsConfig from '../config/pools.json';

import {
  allowances,
  balanceKey,
  balances,
  bumpLifecycle,
  contract,
  eth,
  functionKey,
  pools,
  trackBalance,
} from '../stores/eth.js';


const recipeAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"contract IWETH","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_pie","type":"address"},{"internalType":"uint256","name":"_poolAmountOut","type":"uint256"}],"name":"calcToEth","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_pie","type":"address"},{"internalType":"uint256","name":"_poolAmount","type":"uint256"}],"name":"calcToPie","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"die","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"gasSponsor","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oSlot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"registry","outputs":[{"internalType":"contract ISmartPoolRegistry","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"saveEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"saveToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pie","type":"address"},{"internalType":"uint256","name":"_poolAmount","type":"uint256"},{"internalType":"uint256","name":"_minEthAmount","type":"uint256"}],"name":"toEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_pie","type":"address"},{"internalType":"uint256","name":"_poolAmount","type":"uint256"}],"name":"toPie","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"togglePause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const poolUpdatePids = {};

const allowanceSubscriptions = new Set();
const balanceSubscriptions = new Set();

export const getTokenImage = (tokenAddress) => (images.logos[tokenAddress]
  ? images.logos[tokenAddress]
  : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`);

const enqueueWeightUpdate = (poolAddress) => {
  clearTimeout(poolUpdatePids[poolAddress]);
  setTimeout(() => {
    poolUpdatePids[poolAddress] = updatePoolWeight(poolAddress);
  }, 500);
};

const rawAmountVsBalance = (address, amount, pooledToken) => {
  let balance = BigNumber(0);

  if (address) {
    const key = balanceKey(pooledToken.address, address);
    const rawBalance = get(balances)[key];
    if (rawBalance) {
      balance = BigNumber(rawBalance);
    }
  }

  if (isBigNumber(balance)) {
    const amountRequired = pooledTokenAmountRequired(amount, pooledToken, true);
    return balance.minus(amountRequired);
  }

  return BigNumber(0);
};

const updatePoolWeight = async (poolAddress) => {
  const { composition } = poolsConfig[poolAddress];

  const poolContract = await contract({ address: poolAddress });
  const bPoolAddress = await poolContract.getBPool();

  await Promise.all(composition.map(({ address }) => subscribeToBalance(address, bPoolAddress)));

  const allCurrentBalances = get(balances);
  const poolCurrentBalances = {};

  composition.forEach(({ address }) => {
    const key = balanceKey(address, bPoolAddress);
    poolCurrentBalances[address] = allCurrentBalances[key];
  });

  const total = Object.values(poolCurrentBalances).reduce(
    (sum, value) => sum.plus(value),
    BigNumber(0),
  );

  const updates = {};
  updates[poolAddress] = composition.map((definition) => {
    const percentage = BigNumber(poolCurrentBalances[definition.address])
      .dividedBy(total)
      .multipliedBy(100)
      .toNumber();

    return { ...definition, percentage };
  });

  pools.set({ ...get(pools), ...updates });
};

export const formatFiat = (value, separator = ',', decimal = '.', fiat = '$') => {
  if (!value) return 'n/a';
  try {
    const values = value.toString().replace(/^-/, '').split('.');
    const dollars = values[0];
    const cents = values[1];
    const groups = /(\d)(?=(\d{3})+\b)/g;
    return `${fiat} ${'#'.replace(
      '#',
      `${dollars.replace(groups, `$1${separator}`)}${cents ? decimal + cents : ''}`,
    )}`;
  } catch (e) {
    console.error(e);
    return value === undefined ? '-' : value;
  }
};

export const amountFormatter = ({
  amount,
  approximatePrefix = '~',
  displayDecimals = 3,
  lessThanPrefix = '< ',
  rounding = BigNumber.ROUND_DOWN,
  maxDigits,
}) => {
  if (!amount) {
    return '';
  }

  let decimals = displayDecimals;
  const prefix = '@pie-dao/utils - amountFormatter';
  const value = BigNumber(amount);

  validateIsBigNumber(value, { prefix });

  if (isNumber(maxDigits)) {
    let left = 0;
    while (BigNumber(10 ** left).isLessThan(value)) {
      left += 1;
    }
    const maxDecimals = maxDigits - left;
    if (maxDecimals < 0) {
      decimals = 0;
    } else if (maxDecimals < decimals) {
      decimals = maxDecimals;
    }
  }

  if (value.isZero()) {
    return value.toFixed(decimals);
  }

  const smallest = BigNumber(1)
    .dividedBy(10 ** decimals)
    .toString();

  if (value.isLessThan(smallest)) {
    return `${lessThanPrefix}${smallest}`;
  }

  const base = value.toFixed(decimals, rounding);

  if (value.isGreaterThan(base)) {
    return `${approximatePrefix}${base}`;
  }

  return base;
};

export const amountVsBalance = (amt, pooledToken, raw = false) => {
  const { address } = get(eth);
  const amount = BigNumber(amt);
  let amountDifference = BigNumber(0);

  if (address && isBigNumber(amount)) {
    amountDifference = rawAmountVsBalance(address, amount, pooledToken);
  } else if (isBigNumber(amount)) {
    amountDifference = rawAmountVsBalance(undefined, amount, pooledToken);
  }

  if (raw) {
    return amountDifference;
  }

  if (amountDifference.isLessThan(0)) {
    return BigNumber(0).minus(amountDifference).toFixed(8);
  }

  return amountDifference.toFixed(8);
};

export const amountVsBalanceClass = (amt, pooledToken) => {
  const amountDifference = amountVsBalance(amt, pooledToken, true);

  if (amountDifference.isLessThan(0)) {
    return 'negative';
  }

  if (amountDifference.isGreaterThan(0)) {
    return 'positive';
  }

  return 'neutral';
};

export const pooledTokenAmountRequired = (amt, { percentage }, raw = false) => {
  const amount = BigNumber(amt);
  let requiredAmount = BigNumber(0);

  if (isBigNumber(amount)) {
    requiredAmount = amount.multipliedBy(BigNumber(percentage).dividedBy(100));
  }

  if (raw) {
    return requiredAmount;
  }

  return amountFormatter({ amount: requiredAmount, displayDecimals: 8 });
};

export const fetchPieTokens = (balancesData) => poolsConfig.selectable.map((address) => {
  const ethData = get(eth);
  const icon = getTokenImage(address);
  const { symbol } = poolsConfig[address];
  let balance = BigNumber(0);

  if (ethData.address) {
    subscribeToBalance(address, ethData.address);

    const balKey = balanceKey(address, ethData.address);
    balance = balancesData[balKey];
  }

  balance = amountFormatter({
    amount: balance,
    approximatePrefix: '',
    displayDecimals: 8,
    maxDigits: 10,
  });

  return {
    address,
    balance,
    icon,
    symbol,
  };
});

export const fetchEthBalance = (address) => {
  subscribeToBalance(null, address);
};

export const fetchCalcToPie = async (pieAddress, poolAmount) => {
  validateIsAddress(pieAddress);
  const recipe = await contract({ address: '0xca9af520706a57cecde6f596852eabb5a0e6bb0e', abi: recipeAbi });

  const amount = ethers.BigNumber.from( BigNumber(poolAmount).multipliedBy(10 ** 18).toFixed(0) );
  console.log('amount', amount.toString());

  const amountEthNecessary = await recipe.calcToPie(pieAddress, amount );
  console.log('amountEthNecessary', amountEthNecessary.toString());

  return {
    val: amountEthNecessary,
    label: ethers.utils.formatEther(amountEthNecessary)
  };
}

export const fetchPooledTokens = (token, amount, current, allowancesData, balancesData) => {
  const composition = current || poolsConfig[token];

  return composition.map((pooledToken) => {
    const amountRequired = pooledTokenAmountRequired(amount, pooledToken, true);
    const amtVsBalance = amountVsBalance(amount, pooledToken);
    const amtVsBalanceClass = amountVsBalanceClass(amount, pooledToken);
    const ethData = get(eth);
    const icon = getTokenImage(pooledToken.address); // images.logos[pooledToken.symbol];
    const { address } = pooledToken;

    let actionBtnClass = 'hidden';
    let actionBtnLabel = '';

    const buyLink = pooledToken.buyLink
      || 'https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0';

    if (ethData.address) {
      subscribeToAllowance(address, ethData.address, token);
      subscribeToBalance(address, ethData.address);

      const allowanceKey = functionKey(address, 'allowance', [ethData.address, token]);
      const allowance = allowancesData[allowanceKey];
      const balKey = balanceKey(address, ethData.address);

      if (
        balancesData[balKey]
        && balancesData[balKey].isGreaterThan(amountRequired)
        && (!isBigNumber(allowance) || allowance.isLessThan(amountRequired))
      ) {
        actionBtnClass = 'btn-unlock cursor rounded-20px h-26px bg-white border border-black w-60px m-auto text-center text-xs font-thin leading-26px';
        actionBtnLabel = 'Unlock';
      } else if (balancesData[balKey] && balancesData[balKey].isLessThan(amountRequired)) {
        actionBtnClass = 'btn-buy cursor rounded-20px h-26px bg-black text-white w-60px m-auto text-center text-xs font-thin leading-26px';
        actionBtnLabel = 'BUY';
      } else {
        actionBtnClass = 'btn-buy rounded-20px h-26px bg-white text-grey w-60px m-auto text-center text-xs font-thin leading-26px';
        actionBtnLabel = 'ready';
      }
    }

    return {
      ...pooledToken,

      actionBtnClass,
      actionBtnLabel,
      amountRequired: amountFormatter({
        amount: amountRequired,
        approximatePrefix: '',
        displayDecimals: 8,
        maxDigits: 10,
      }),
      amountVsBalance: amountFormatter({
        amount: amtVsBalance,
        approximatePrefix: '',
        displayDecimals: 8,
        maxDigits: 10,
      }),
      amountVsBalanceClass: amtVsBalanceClass,
      buyLink,
      icon,
    };
  });
};

export const maxAmount = (token, current, multiplier = 0.99) => {
  validateIsAddress(token);

  const balancesData = get(balances);
  const composition = current || poolsConfig[token];
  const ethData = get(eth);

  if (!ethData.address) {
    return BigNumber(0);
  }

  return composition
    .reduce((acc, { address, percentage }) => {
      const balKey = balanceKey(address, ethData.address);
      const balance = balancesData[balKey];
      const amountPerUnit = BigNumber(percentage).dividedBy(100);
      const localMax = balance.dividedBy(amountPerUnit);
      return localMax.isLessThan(acc) ? localMax : acc;
    }, BigNumber(100000000000000))
    .multipliedBy(multiplier);
};

export const subscribeToAllowance = async (token, address, spender) => {
  validateIsAddress(token);
  validateIsAddress(address);
  validateIsAddress(spender);

  const args = [address, spender];
  const key = functionKey(token, 'allowance', args);

  if (allowanceSubscriptions.has(key)) {
    return;
  }

  allowanceSubscriptions.add(key);

  const tokenContract = await contract({ address: token });
  const trackable = tokenContract.functions.allowance(...args);
  const observable = await trackable.track();
  const decimals = await tokenContract.decimals();

  observable.subscribe({
    next: async (updatedAllowance) => {
      const updates = {};
      updates[key] = BigNumber(updatedAllowance).dividedBy(10 ** decimals);
      const existingAllowance = get(allowances)[key];
      if (!updates[key].isEqualTo(existingAllowance)) {
        allowances.set({ ...get(allowances), ...updates });
      }
    },
  });

  bumpLifecycle();
};



export const subscribeToBalance = async (tokenAddress, address) => {
  let token = tokenAddress;

  if (!token) {
    token = ethers.constants.AddressZero;
  }

  validateIsAddress(token);
  validateIsAddress(address);

  const key = balanceKey(token, address);

  if (balanceSubscriptions.has(key)) {
    return;
  }

  balanceSubscriptions.add(key);

  const observable = await trackBalance(address, tokenAddress);
  let decimals = 18;

  if (token !== ethers.constants.AddressZero) {
    const tokenContract = await contract({ address: token });
    decimals = await tokenContract.decimals();
  }

  observable.subscribe({
    next: async (updatedBalance) => {
      const updates = {};
      updates[key] = BigNumber(updatedBalance).dividedBy(10 ** decimals);
      balances.set({ ...get(balances), ...updates });
    },
  });

  bumpLifecycle();
};

export const subscribeToPoolWeights = async (poolAddress) => {
  validateIsAddress(poolAddress);

  // if (get(pools)[poolAddress]) {
  //   return;
  // }

  const { composition } = poolsConfig[poolAddress];
  const updates = {};
  updates[poolAddress] = composition;

  pools.set({ ...get(pools), ...updates });

  const poolContract = await contract({ address: poolAddress });
  const bPoolAddress = await poolContract.getBPool();

  await Promise.all(composition.map(({ address }) => subscribeToBalance(address, bPoolAddress)));

  composition.forEach(async ({ address }) => {
    const tokenContract = await contract({ address });
    const observable = await tokenContract.trackBalance(bPoolAddress);
    observable.subscribe({
      next: () => {
        enqueueWeightUpdate(poolAddress);
      },
    });
  });

  bumpLifecycle();
};
