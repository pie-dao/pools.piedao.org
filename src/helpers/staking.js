import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { _ } from 'svelte-i18n';
import sharesTimeLockABI from '../abis/sharesTimeLock.json';
import veDoughABI from '../abis/veDoughABI.json';
import smartcontracts from '../config/smartcontracts.json';
import { subgraphRequest } from '../helpers/subgraph.js';
import { subject } from '../stores/eth.js';
import displayNotification from '../notifications';

export let dataObj = {
  totalStaked: BigNumber(0),
  veTokenTotalSupply: BigNumber(0),
  accountVeTokenBalance: BigNumber(0),
  accountWithdrawableRewards: BigNumber(0),
  accountWithdrawnRewards: BigNumber(0),
  accountDepositTokenBalance: BigNumber(0),
  accountLocks: [],
  rewards: [],
};

export let sharesTimeLock = false;
export let veDOUGH = false;

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

export function initialize(eth) {
  return new Promise(async(resolve, reject) => {
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
      resolve(dataObj);
    } catch (error) {
      displayNotification({
        message: error.message,
        type: 'error',
      });

      reject(error);
    }
  });
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

    rewards = response.rewards;
    staker = response.stakers[0];
  } catch (error) {
    console.error(error);
    // using onchain as fallback...
    staker = await sharesTimeLock.getStakingData(eth.address);
    rewards = dataObj.rewards.length > 0 ? dataObj.rewards : [];
  }

  if (staker !== undefined) {
    Object.keys(staker).forEach((key) => {
      if (key != 'accountLocks') {
        dataObj[key] = new BigNumber(staker[key].toString());
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

        dataObj[key] = locks;
      }
    });
  }

  dataObj['rewards'] = rewards;
  console.log('fetchStakingData', dataObj);

  dataObj = dataObj;
  return dataObj;
};

export function boostToMax(id, eth) {
  return new Promise(async (resolve, reject) => {
    if (!sharesTimeLock) 
      reject("ShareTimeLock contract has not being initiated.");

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
            await fetchStakingData(eth);  
            subscription.unsubscribe();

            resolve(dataObj);
          },
        });
      });
    } catch (error) {
      displayNotification({
        message: error.message,
        type: 'error',
      });

      reject(error);
    }
  });
}

export async function unstakeDOUGH(id, lockAmount, eth) {
  return new Promise(async (resolve, reject) => {
    if (!sharesTimeLock) 
      reject("ShareTimeLock contract has not being initiated.");

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
            await fetchStakingData(eth);
            subscription.unsubscribe();

            resolve(dataObj);
          },
        });
      });
    } catch (error) {
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

      reject(error);
    }
  });
}