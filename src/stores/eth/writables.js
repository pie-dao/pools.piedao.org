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
export const justBoosted = writable({});
export const timestampBoosted = writable({});
export const stakingDataIntervalRunning = writable(false);
export const stakingDataInterval = writable(5000);
export const stakingStats = writable({
  totalHolders: 0,
  averageTimeLock: 0,
  totalStakedDough: 0,
  totalVeDough: 0,
  totalDough: 0,
});
export const BoostedModalIsOpen = writable(false);
export const UnlockModalIsOpen = writable(false);
export const fetchStakingDataLock = writable(false);
