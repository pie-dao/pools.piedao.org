import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { _ } from 'svelte-i18n';
import sharesTimeLockABI from '../abis/sharesTimeLock.json';
import veDoughABI from '../abis/veDoughABI.json';
import smartcontracts from '../config/smartcontracts.json';
import { subgraphRequest } from '../helpers/subgraph.js';
import { subject } from '../stores/eth.js';
import displayNotification from '../notifications';
import { parseEther } from '@ethersproject/units';
import { isAddress } from '@pie-dao/utils';
import PartecipationJson from '../config/rewards/test.json';
import { createParticipationTree } from '../classes/MerkleTreeUtils';

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
export const minLockAmount = 1;

export const toNum = (num) =>
  BigNumber(num.toString())
    .dividedBy(10 ** 18)
    .toFixed(2);

export const toBN = (num) => BigNumber(num.toString()).multipliedBy(10 ** 18);    

export function calculateStakingEnds(lock) {
  let startDate = new Date(lock.lockedAt * 1000);
  let lockDuration = lock.lockDuration / 60;

  // TODO: remove this line, and use the previous one...
  //startDate.setMonth(startDate.getMonth() + lockDuration);
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
    displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
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
};

export function didLockExpired(lock) {
  let endDate = calculateStakingEnds(lock);
  let nowDate = new Date();
  return nowDate > endDate;
}

export function calculateVeDough(stakedDough, commitment) {
  let k = 56.0268900276223;
  let commitmentMultiplier = (commitment / k) * Math.log10(commitment);
  return toNum(stakedDough * commitmentMultiplier);
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
}

export function stakeDOUGH(stakeAmount, stakeDuration, receiver, eth) {
  return new Promise(async(resolve, reject) => {
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
              message: `You staked successfully`,
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
        message: error.message,
        type: 'error',
      });

      reject(error);
    }
  });
}

export async function claim(eth) {
  return new Promise(async(resolve, reject) => {
    const proof = prepareProofs(eth);
    console.log('proof', proof);
  
    try {
      const { emitter } = displayNotification(await veDOUGH.claim(proof.proof));
  
      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: `Pay day baby!`,
              type: 'success',
            });

            stakeAmount = 0;
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
}

export function prepareProofs(eth) {
  if (!eth.address) return;
  const merkleTree = createParticipationTree(PartecipationJson);

  console.log('merkleTree', merkleTree);
  const leaf = merkleTree.leafs.find(
    (item) => item.address.toLowerCase() === eth.address.toLowerCase(),
  );

  return {
    valid: leaf ? true : false,
    proof: leaf ? merkleTree.merkleTree.getProof(leaf.leaf) : null,
  };
}