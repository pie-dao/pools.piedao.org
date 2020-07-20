import BigNumber from "bignumber.js";

import { get } from "svelte/store";
import { isBigNumber, validateIsAddress, validateIsBigNumber } from "@pie-dao/utils";

import images from "../config/images.json";
import poolsConfig from "../config/pools.json";

import {
  allowances,
  balanceKey,
  balances,
  contract,
  eth,
  functionKey,
  pools,
} from "../stores/eth.js";

let poolUpdatePids = {};

const allowanceSubscriptions = new Set();
const balanceSubscriptions = new Set();

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
    const balance = BigNumber(get(balances)[key]);
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
  let poolCurrentBalances = {};

  composition.forEach(({ address }) => {
    const key = balanceKey(address, bPoolAddress);
    poolCurrentBalances[address] = allCurrentBalances[key];
  });

  let total = Object.values(poolCurrentBalances).reduce(
    (sum, value) => sum.plus(value),
    BigNumber(0)
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

export const amountFormatter = ({
  amount,
  approximatePrefix = "~",
  displayDecimals = 3,
  lessThanPrefix = "< ",
  rounding = BigNumber.ROUND_DOWN,
}) => {
  if (!amount) {
    return "";
  }

  const prefix = "@pie-dao/utils - amountFormatter";
  const value = BigNumber(amount);

  validateIsBigNumber(value, { prefix });

  if (value.isZero()) {
    return value.toFixed(displayDecimals);
  }

  const smallest = BigNumber(1)
    .dividedBy(10 ** displayDecimals)
    .toString();

  if (value.isLessThan(smallest)) {
    return `${lessThanPrefix}${smallest}`;
  }

  const base = value.toFixed(displayDecimals, BigNumber.ROUND_DOWN);

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
    return "negative";
  }

  if (amountDifference.isGreaterThan(0)) {
    return "positive";
  }

  return "neutral";
};

export const pooledTokenAmountRequired = (amt, { percentage, symbol }, raw = false) => {
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

export const fetchPooledTokens = (token, current) => {
  const composition = current || poolsConfig[token];

  return composition.map((pooledToken) => {
    const icon = images.logos[pooledToken.symbol];

    return { ...pooledToken, icon };
  });
};

export const subscribeToAllowance = async (token, address, spender) => {
  validateIsAddress(token);
  validateIsAddress(address);
  validateIsAddress(spender);

  const args = [address, spender];
  const key = functionKey(token, "allowance", args);

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
        balances.set({ ...get(allowances), ...updates });
      }
    },
  });
};

export const subscribeToBalance = async (token, address) => {
  validateIsAddress(token);
  validateIsAddress(address);

  const key = balanceKey(token, address);

  if (balanceSubscriptions.has(key)) {
    return;
  }

  balanceSubscriptions.add(key);

  const tokenContract = await contract({ address: token });
  const observable = await tokenContract.trackBalance(address);
  const decimals = await tokenContract.decimals();
  console.log("subscribing to balance", key, decimals);

  observable.subscribe({
    next: async (updatedBalance) => {
      const updates = {};
      updates[key] = BigNumber(updatedBalance).dividedBy(10 ** decimals);
      console.log("Balance update", updates);
      balances.set({ ...get(balances), ...updates });
    },
  });
};

export const subscribeToPoolWeights = async (poolAddress) => {
  validateIsAddress(poolAddress);

  if (get(pools)[poolAddress]) {
    return;
  }

  const { composition } = poolsConfig[poolAddress];
  const updates = {};
  updates[poolAddress] = composition;

  pools.set({ ...get(pools), ...updates });

  const poolContract = await contract({ address: poolAddress });
  const bPoolAddress = await poolContract.getBPool();

  await Promise.all(composition.map(({ address }) => subscribeToBalance(address, bPoolAddress)));

  composition.forEach(async ({ address }) => {
    const key = balanceKey(address, bPoolAddress);
    const tokenContract = await contract({ address });
    const observable = await tokenContract.trackBalance(bPoolAddress);
    observable.subscribe({
      next: () => {
        enqueueWeightUpdate(poolAddress);
      },
    });
  });
};
