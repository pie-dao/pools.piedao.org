import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { _ } from 'svelte-i18n';
import sharesTimeLockABI from '../abis/sharesTimeLock.json';
import veDoughABI from '../abis/veDoughABI.json';
import smartcontracts from '../config/smartcontracts.json';
import { subgraphRequest } from '../helpers/subgraph.js';
import { subject } from '../stores/eth.js';
import displayNotification from '../notifications';

export let receiver = '';
export let sharesTimeLock = false;
export let veDOUGH = false;

export let data = {
  totalStaked: BigNumber(0),
  veTokenTotalSupply: BigNumber(0),
  accountVeTokenBalance: BigNumber(0),
  accountWithdrawableRewards: BigNumber(0),
  accountWithdrawnRewards: BigNumber(0),
  accountDepositTokenBalance: BigNumber(0),
  accountLocks: [],
  rewards: [],
};

export const toNum = (num) =>
  BigNumber(num.toString())
    .dividedBy(10 ** 18)
    .toFixed(2);

export const toBN = (num) => BigNumber(num.toString()).multipliedBy(10 ** 18);    

export function calculateStakingEnds(lock) {
  let startDate = new Date(lock.lockedAt * 1000);
  let lockDuration = lock.lockDuration / 60;

  //startDate.setMonth(startDate.getMonth() + lockDuration);

  // TODO: remove this line, and use the previous one...
  startDate.setMinutes(startDate.getMinutes() + lockDuration);

  return startDate;
}

export function getLockStatus(lock) {
  if (lock.withdrawn) {
    return 'withdrawn';
  } else {
    if (lock.ejected) {
      return 'ejected';
    } else {
      return 'running';
    }
  }
}

export function didLockExpired(lock) {
  let endDate = calculateStakingEnds(lock);
  let nowDate = new Date();
  return nowDate > endDate;
}

export function calculateVeDough(stakedDough, commitment) {
  let k = 56.0268900276223;
  let commitmentMultiplier = (commitment / k) * Math.log10(commitment);
  let veDOUGH = stakedDough * commitmentMultiplier;
  return toNum(veDOUGH);
}

export async function initialize(eth) {
  try {
    sharesTimeLock = new ethers.Contract(
      smartcontracts.doughStaking,
      sharesTimeLockABI,
      eth.signer || eth.provider,
    );

    veDOUGH = new ethers.Contract(
      smartcontracts.veDOUGH,
      veDoughABI,
      eth.signer || eth.provider,
    );

    await fetchStakingData(eth);
    receiver = eth.address;
  } catch (e) {
    console.log('Something went wrong...', e);
  }
}

export async function fetchStakingDataGraph(address) {
  try {
    const response = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/chiptuttofuso/piedaosubgraphdevelop',
      {
        stakers: {
          __args: {
            where: { id: address.toLowerCase() },
          },
          id: true,
          totalStaked: true,
          veTokenTotalSupply: true,
          accountVeTokenBalance: true,
          accountWithdrawableRewards: true,
          accountWithdrawnRewards: true,
          accountDepositTokenBalance: true,
          accountDepositTokenAllowance: true,
          accountLocks: {
            id: true,
            lockId: true,
            lockDuration: true,
            lockedAt: true,
            amount: true,
            withdrawn: true,
            ejected: true,
            boosted: true,
            boostedPointer: true,
          },
        },
        rewards: {
          __args: {
            where: { staker: address.toLowerCase() },
          },
          id: true,
          timestamp: true,
          amount: true,
          type: true,
        },
      },
    );

    return response;
  } catch (error) {
    throw new Error('fetchStakingDataGraph: ' + error.message);
  }
}

export const fetchStakingData = async (eth) => {
  let response = null;
  let staker = null;
  let rewards = null;

  // this is a fallback in case the graph is not working...
  try {
    // using graph...
    response = await fetchStakingDataGraph(eth.address);
    console.log('response for ' + eth.address.toLowerCase(), response);
    rewards = response.rewards;
    staker = response.stakers[0];
  } catch (error) {
    console.error(error);
    // using onchain as fallback...
    staker = await sharesTimeLock.getStakingData(eth.address);
    rewards = data.rewards.length > 0 ? data.rewards : [];
  }

  if (staker !== undefined) {
    Object.keys(staker).forEach((key) => {
      if (key != 'accountLocks') {
        data[key] = new BigNumber(staker[key].toString());
      } else {
        let locks = [];

        staker[key].forEach((lock, index) => {
          if (lock.amount.toString() != '0') {
            locks.push({
              amount: new BigNumber(lock.amount.toString()),
              lockDuration: lock.lockDuration,
              lockedAt: lock.lockedAt,
              lockId: lock.lockId || index,
              // when the graph is not working properly,
              // all those fields will be undefined...
              withdrawn: lock.withdrawn,
              ejected: lock.ejected,
              boosted: lock.boosted,
              boostedPointer: lock.boostedPointer,
            });
          }
        });

        locks.sort(function (lock_a, lock_b) {
          return lock_b.lockedAt - lock_a.lockedAt;
        });

        data[key] = locks;
      }
    });
  }

  data['rewards'] = rewards;
  console.log('fetchStakingData', data);

  data = data;
  return data;
};

// TODO: to be improved, it must work fully async and resolve once it's all really done...
export async function boostToMax(id) {
  if (!sharesTimeLock) return;

  try {
    let response = await sharesTimeLock.boostToMax(id);

    const { emitter } = displayNotification({
      hash: response.hash,
    });

    emitter.on('txConfirmed', async () => {
      displayNotification({
        message: `You boosted your stake to 36 months!`,
        type: 'success',
      });

      const subscription = subject('blockNumber').subscribe({
        next: async () => {
          console.log('boostToMax -> blockNumber');

          await fetchStakingData();

          subscription.unsubscribe();
        },
      });
    });
  } catch (error) {
    console.log(error);
    displayNotification({
      message: e.message,
      type: 'error',
    });
  }
}

// TODO: to be improved, it must work fully async and resolve once it's all really done...
export async function unstakeDOUGH(id, lockAmount) {
  if (!sharesTimeLock) return;

  try {
    let response = await sharesTimeLock.withdraw(id);

    const { emitter } = displayNotification({
      hash: response.hash,
    });

    emitter.on('txConfirmed', async () => {
      displayNotification({
        message: `You unstaked ${lockAmount.toString()} DOUGH`,
        type: 'success',
      });

      const subscription = subject('blockNumber').subscribe({
        next: async () => {
          console.log('unstakeDOUGH -> blockNumber');

          await fetchStakingData();
          subscription.unsubscribe();
        },
      });
    });
  } catch (error) {
    console.log(error.message);
    if (error.message.includes('lock not expired')) {
      displayNotification({
        message: "can't unstake, lock not expired.",
        type: 'error',
      });
    } else {
      displayNotification({
        message: 'sorry, some error occurred while unstaking. Please try again later...',
        type: 'error',
      });
    }
  }
}