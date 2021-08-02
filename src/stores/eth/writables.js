import { writable } from 'svelte/store';

export const defaultEth = {
  address: undefined,
  icon: undefined,
  network: {},
  provider: undefined,
  shortAddress: '',
  signer: undefined,
  balance: undefined,
};

export const allowances = writable({});
export const balances = writable({});
export const farming = writable({});
export const eth = writable({ ...defaultEth, currentBlockNumber: 0 });
export const pools = writable({ composition: [], nav: 0 });
