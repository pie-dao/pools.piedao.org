import BigNumber from "bignumber.js";

import { get } from "svelte/store";
import { validateIsAddress, validateIsBigNumber } from "@pie-dao/utils";

import poolsConfig from "../config/pools.json";

import { balances, contract, pools } from "../stores/eth.js";

let poolUpdatePids = {};

const balanceSubscriptions = new Set();

const enqueueWeightUpdate = (poolAddress) => {
  clearTimeout(poolUpdatePids[poolAddress]);
  setTimeout(() => {
    poolUpdatePids[poolAddress] = updatePoolWeight(poolAddress);
  }, 500);
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

export const balanceKey = (token, address) => {
  validateIsAddress(token);
  validateIsAddress(address);
  return `${token}.${address}`.toLowerCase();
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

  observable.subscribe({
    next: async (updatedBalance) => {
      const decimals = await tokenContract.decimals();
      const updates = {};
      updates[key] = BigNumber(updatedBalance).dividedBy(10 ** decimals);
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
    const tokenContract = await contract({ address: bPoolAddress });
    const observable = await tokenContract.trackBalance(address);
    observable.subscribe({
      next: () => {
        enqueueWeightUpdate(poolAddress);
      },
    });
  });
};
