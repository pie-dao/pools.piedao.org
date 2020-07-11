import BigNumber from "bignumber.js";

import { get } from "svelte/store";
import { validateIsAddress } from "@pie-dao/utils";

import { balances, contract } from "../stores/eth.js";

const balanceSubscriptions = new Set();

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
