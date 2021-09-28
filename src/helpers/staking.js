/* eslint-disable no-unused-vars */
import { _ } from 'svelte-i18n';
/* eslint-enable no-unused-vars */
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseEther } from '@ethersproject/units';
import { isAddress } from '@pie-dao/utils';
import { Observable } from 'rxjs';
import moment from 'moment';
import sharesTimeLockABI from '../abis/sharesTimeLock.json';
import veDoughABI from '../abis/veDoughABI.json';
import DoughABI from '../abis/DoughABI.json';
import smartcontracts from '../config/smartcontracts.json';
import { subgraphRequest } from './subgraph.js';
import { subject, approve, approveMax, connectWeb3 } from '../stores/eth.js';
import displayNotification from '../notifications';
import PartecipationJson from '../config/rewards/test.json';
import { createParticipationTree } from '../classes/MerkleTreeUtils';
import { stakingDataInterval } from '../stores/eth/writables.js';

/* eslint-disable import/no-mutable-exports */
export let dataObj = {
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
};

export let sharesTimeLock = false;
export let veDOUGH = false;
export const minLockAmount = 1;
export const AVG_SECONDS_MONTH = 60;
let ETH = null;

/* eslint-enable import/no-mutable-exports */

// in a very next future, this function will fetch directly from backend...
export const getParticipations = () => PartecipationJson;

export const canRestake = (lockedAt) => {
  const start = lockedAt * 1000;
  const end = moment().endOf('day');

  if (end.diff(start, 'days') > 30) {
    return true;
  }
  return false;
};

export const observable = new Observable((subscriber) => {
  let interval = null;

  stakingDataInterval.subscribe((intervalRange) => {
    interval = setInterval(async () => {
      const updatedData = await fetchStakingData(ETH);

      // updating the stakingData just when needed...
      if (JSON.stringify(dataObj) !== JSON.stringify(updatedData)) {
        dataObj = updatedData;
        subscriber.next(dataObj);
      }
    }, intervalRange);
  });

  // clearing interval, when unsubscribe action happens...
  return () => {
    clearInterval(interval);
  };
});

export const toNum = (num) => BigNumber(num.toString())
  .dividedBy(10 ** 18)
  .toFixed(2);

export const toBN = (num) => BigNumber(num.toString()).multipliedBy(10 ** 18);

export function calculateStakingStarts(lock) {
  const startDate = new Date(lock.lockedAt * 1000);
  return startDate;
}

export function calculateStakingEnds(lock) {
  const endDate = new Date(lock.lockedAt * 1000);
  const lockDuration = lock.lockDuration / AVG_SECONDS_MONTH;
  endDate.setMonth(endDate.getMonth() + lockDuration);
  // endDate.setMinutes(endDate.getMinutes() + lockDuration);
  return endDate;
}

export function getLockStatus(lock) {
  if (lock.withdrawn) {
    return 'Withdrawn';
  }
  if (lock.ejected) {
    return 'Ejected';
  }
  return 'Running';
}

export function safeFlow(stakeAmount, stakeDuration, receiver, eth) {
  const Errors = {
    NOT_CONNECTED: {
      code: 1,
      message: 'The wallet is not connected or signer not available',
    },
    NOT_APPROVED: {
      code: 2,
      message: 'Allowance too low',
    },
    NOT_INITIALIZED: {
      code: 2,
      message: 'Timelock not initialized',
    },
    WRONG_DURATION: {
      code: 2,
      message: 'Duration Value incorrect',
    },
    TOO_SMALL: {
      code: 4,
      message: 'Deposit amount too small',
    },
    NOT_VALID_ADDRESS: {
      code: 2,
      message: 'Receiver is not a valid address',
    },
  };

  if (!eth.address || !eth.signer) {
    /* eslint-disable  no-undef */
    displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
    /* eslint-enable  no-undef */
    connectWeb3();
    return Errors.NOT_CONNECTED;
  }

  if (!sharesTimeLock) {
    displayNotification({ message: Errors.NOT_INITIALIZED.message, type: 'hint' });
    return Errors.NOT_INITIALIZED;
  }

  if (stakeAmount < minLockAmount) {
    displayNotification({ message: 'Deposit amount too small', type: 'hint' });
    return Errors.NOT_CONNECTED;
  }

  if (!stakeDuration) {
    displayNotification({ message: Errors.WRONG_DURATION.message, type: 'hint' });
    return Errors.WRONG_DURATION;
  }

  if (!isAddress(receiver)) {
    displayNotification({ message: Errors.NOT_VALID_ADDRESS.message, type: 'hint' });
    return Errors.NOT_VALID_ADDRESS;
  }

  return false;
}

export function didLockExpired(lock) {
  const endDate = calculateStakingEnds(lock);
  const nowDate = new Date();
  return nowDate > endDate;
}

export function calculateVeDough(stakedDough, commitment) {
  const k = 56.0268900276223;
  const commitmentMultiplier = (commitment / k) * Math.log10(commitment);
  return toNum(stakedDough * commitmentMultiplier);
}

export function initContracts(eth) {
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
}

export function initialize(eth) {
  ETH = eth;
  /* eslint-disable no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    try {
      initContracts(eth);

      dataObj = await fetchStakingData(eth);
      resolve(dataObj);
    } catch (error) {
      displayNotification({
        message: error.message,
        type: 'error',
      });

      reject(error);
    }
  });
  /* eslint-enable no-async-promise-executor */
}

export async function getLastLockForAddress(eth) {
  try {
    if (!sharesTimeLock) {
      initContracts(eth);
    }

    const totalLocks = await sharesTimeLock.getLocksOfLength(eth.address);
    return totalLocks - 1;
  } catch (error) {
    return error;
  }
}

export async function calculateDoughTotalSupply(provider) {
  try {
    const dough = new ethers.Contract(
      smartcontracts.dough,
      DoughABI,
      provider,
    );

    const totalSupply = await dough.totalSupply();

    const treasury = await dough.balanceOf(smartcontracts.treasury);
    const multisig = await dough.balanceOf(smartcontracts.multisig);
    const eDough = await dough.balanceOf(smartcontracts.eDOUGH);

    return totalSupply - treasury - multisig - eDough;
  } catch (error) {
    return error;
  }
}

export async function fetchStakingStats(provider) {
  try {
    const totalSupply = await calculateDoughTotalSupply(provider);

    const response = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/chiptuttofuso/piedaosubgraphdevelop',
      {
        stakersTrackers: {
          __args: {
            where: { id: 'StakersTrackerID' },
          },
          id: true,
          counter: true,
        },
        globalStats: {
          __args: {
            first: 1,
            orderBy: 'id',
            orderDirection: 'desc',
          },
          id: true,
          depositedLocksCounter: true,
          depositedLocksValue: true,
          withdrawnLocksCounter: true,
          withdrawnLocksValue: true,
          ejectedLocksCounter: true,
          ejectedLocksValue: true,
          boostedLocksCounter: true,
          boostedLocksValue: true,
          averageTimeLock: true,
          totalDoughStaked: true,
          veTokenTotalSupply: true,
        },
      },
    );

    return {
      totalHolders: response.stakersTrackers.length ? response.stakersTrackers[0].counter : 0,
      averageTimeLock: response.globalStats.length
        ? Math.floor(Number(response.globalStats[0].averageTimeLock) / AVG_SECONDS_MONTH) : 0,
      totalStakedDough: response.globalStats.length ? response.globalStats[0].totalDoughStaked : 0,
      totalVeDough: response.globalStats.length ? response.globalStats[0].veTokenTotalSupply : 0,
      totalDough: totalSupply,
    };
  } catch (error) {
    throw new Error(`fetchStakingStats: ${error.message}`);
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
          accountVeTokenBalance: true,
          accountWithdrawableRewards: true,
          accountWithdrawnRewards: true,
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
        globalStats: {
          __args: {
            first: 1,
            orderBy: 'id',
            orderDirection: 'desc',
          },
          totalDoughStaked: true,
          veTokenTotalSupply: true,
        },
      },
    );

    return response;
  } catch (error) {
    throw new Error(`fetchStakingDataGraph: ${error.message}`);
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

    if (response.stakers.length) {
      rewards = response.rewards;
      /* eslint-disable prefer-destructuring */
      staker = response.stakers[0];
      /* eslint-enable prefer-destructuring */
    } else {
      throw new Error("no data on subgraph yet, let's fallback to onchain datas");
    }
  } catch (error) {
    // using onchain as fallback...
    staker = await sharesTimeLock.getStakingData(eth.address);
    rewards = dataObj.rewards.length > 0 ? dataObj.rewards : [];
  }

  dataObj.totalDoughStaked = response.globalStats[0].totalDoughStaked;
  dataObj.veTokenTotalSupply = response.globalStats[0].veTokenTotalSupply;

  if (staker !== undefined) {
    Object.keys(staker).forEach((key) => {
      if (key !== 'accountLocks') {
        dataObj[key] = new BigNumber(staker[key].toString());
      } else {
        const locks = [];
        dataObj.accountAverageDuration = 0;
        dataObj.accountTokenBalance = new BigNumber('0');
        let locksCounter = 0;

        staker[key].forEach((lock, index) => {
          if (lock.amount.toString() !== '0') {
            // calculating accountAverageDuration / accountTokenBalance,
            // escluding those boosted/duplicated locks...
            // (this is because onchain we remove the old lock,
            // and we create a new 36-months-duration one)
            if (lock.boostedPointer === '') {
              locksCounter += 1;
              dataObj.accountTokenBalance = dataObj.accountTokenBalance
                .plus(new BigNumber(lock.amount.toString()));
              dataObj.accountAverageDuration += Number(lock.lockDuration);
            }

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

        dataObj.accountAverageDuration = dataObj.accountAverageDuration
          ? Math.floor((dataObj.accountAverageDuration / locksCounter) / AVG_SECONDS_MONTH)
          : 0;

        locks.sort((lockA, lockB) => lockB.lockedAt - lockA.lockedAt);

        dataObj[key] = locks;
      }
    });
  }

  const votingPower = dataObj.accountVeTokenBalance && dataObj.veTokenTotalSupply
    ? ((dataObj.accountVeTokenBalance.times(100)).div(dataObj.veTokenTotalSupply)).toFixed(2)
    : 0;

  dataObj.accountVotingPower = Number(votingPower);

  dataObj.rewards = rewards.sort((rewardA, rewardB) => rewardB.timestamp - rewardA.timestamp);
  console.log('fetchStakingData', dataObj);

  return dataObj;
};

export function boostToMax(id, eth) {
  /* eslint-disable no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    if (!sharesTimeLock) {
      initContracts(eth);
    }

    try {
      const response = await sharesTimeLock.boostToMax(id);

      const { emitter } = displayNotification({
        hash: response.hash,
      });

      emitter.on('txConfirmed', async () => {
        displayNotification({
          message: 'You boosted your stake to 36 months!',
          type: 'success',
        });

        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            dataObj = await fetchStakingData(eth);
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
  /* eslint-enable no-async-promise-executor */
}

export async function unstakeDOUGH(id, lockAmount, eth) {
  /* eslint-disable no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    if (!sharesTimeLock) {
      initContracts(eth);
    }

    try {
      const response = await sharesTimeLock.withdraw(id);

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
            dataObj = await fetchStakingData(eth);
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
  /* eslint-enable no-async-promise-executor */
}

export function stakeDOUGH(stakeAmount, stakeDuration, receiver, eth) {
  /* eslint-disable  no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    const error = safeFlow(stakeAmount, stakeDuration, receiver, eth);

    if (error) {
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });

      reject(error);
    }

    try {
      const { emitter } = displayNotification(
        await sharesTimeLock.depositByMonths(
          parseEther(stakeAmount.toString()),
          stakeDuration,
          receiver,
        ),
      );

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'You staked successfully',
              type: 'success',
            });

            subscription.unsubscribe();
            dataObj = await fetchStakingData(eth);
            resolve(dataObj);
          },
        });
      });
    } catch (err) {
      displayNotification({
        autoDismiss: 15000,
        message: err.message,
        type: 'error',
      });

      reject(err);
    }
  });
  /* eslint-enable  no-async-promise-executor */
}

export async function claim(eth) {
  /* eslint-disable  no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    const proof = prepareProofs(eth);
    console.log('proof', proof);

    try {
      const { emitter } = displayNotification(await veDOUGH.claim(proof.proof));

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'Pay day baby!',
              type: 'success',
            });

            subscription.unsubscribe();

            dataObj = await fetchStakingData(eth);
            resolve(dataObj);
          },
        });
      });
    } catch (error) {
      displayNotification({
        autoDismiss: 15000,
        message: 'Sorry, an error occurred while claiming your rewards. Please try again later.',
        type: 'error',
      });

      reject(error);
    }
  });
  /* eslint-enable  no-async-promise-executor */
}

export function prepareProofs(eth) {
  if (!eth.address) return;
  const merkleTree = createParticipationTree(PartecipationJson);

  console.log('merkleTree', merkleTree);
  const leaf = merkleTree.leafs.find(
    (item) => item.address.toLowerCase() === eth.address.toLowerCase(),
  );

  /* eslint-disable consistent-return */
  return {
    valid: !!leaf,
    proof: leaf ? merkleTree.merkleTree.getProof(leaf.leaf) : null,
  };
  /* eslint-enable consistent-return */
}

export function approveToken(eth) {
  /* eslint-disable  no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    if (!eth.address || !eth.signer) {
      /* eslint-disable  no-undef */
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      /* eslint-enable  no-undef */
      connectWeb3();
      reject(new Error('wallet not connected'));
    }

    try {
      // resetting the approve to zero, before initiating a new approval...
      if (
        !dataObj.accountDepositTokenAllowance.isEqualTo(0)
        && !dataObj.accountDepositTokenAllowance.isEqualTo(ethers.constants.MaxUint256)
      ) {
        await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
      }

      await approveMax(smartcontracts.dough, smartcontracts.doughStaking, { gasLimit: 100000 });
      dataObj.accountDepositTokenAllowance = ethers.constants.MaxUint256;
      resolve(dataObj);
    } catch (error) {
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });

      reject(error);
    }
  });
  /* eslint-enable  no-async-promise-executor */
}
