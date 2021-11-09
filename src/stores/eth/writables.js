import { writable } from 'svelte/store';
import BigNumber from 'bignumber.js';

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
export const stakingData = writable({
  hasLoaded: false,
  address: null,
  totalDoughStaked: BigNumber(0),
  veTokenTotalSupply: BigNumber(0),
  accountAverageDuration: 0,
  accountVotingPower: 0,
  accountVeTokenBalance: BigNumber(0),
  accountTokenBalance: BigNumber(0),
  accountWithdrawableRewards: BigNumber(0),
  accountWithdrawnRewards: BigNumber(0),
  accountDepositTokenBalance: BigNumber(0),
  accountLocks: [],
  rewards: [],
  votes: null,
  proposals: null
});
export const BoostedModalIsOpen = writable(false);
export const claimModalIsOpen = writable(false);

export const UnlockModalStatus = writable({
  isOpen: false,
  lock: null,
  withdrawnRewards: null,
  countdown: null
});
export const fetchStakingDataLock = writable(false);
