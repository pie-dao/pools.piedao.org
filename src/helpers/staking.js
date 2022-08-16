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
import MerkleTreeDistributorABI from '../abis/MerkleTreeDistributorABI.json';
import ERC20 from '../abis/erc20ABI.json';
import smartcontracts from '../config/smartcontracts.json';
import { subgraphRequest } from './subgraph.js';
import { subject, approve, approveMax, connectWeb3 } from '../stores/eth.js';
import displayNotification from '../notifications';
import EpochJson from '../config/rewards/distribution.json';
import { stakingDataInterval, stakingData } from '../stores/eth/writables.js';
import { fetchLastMonthVoteForVoter, fetchLastSnapshots } from './snapshopt.js'; 
import { get } from 'svelte/store';

export let sharesTimeLock = false;
export let veDOUGH = false;
export let merkleTreeDistributor = false;
export const minLockAmount = 0;
export const AVG_SECONDS_MONTH = 2628000;

let ETH = null;
let _stakingData = get(stakingData);
let observer = null;

// in a very next future, this function will fetch directly from backend...
export const getParticipations = () => EpochJson.claims;

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

  let intervalRange = get(stakingDataInterval);

  interval = setInterval(async () => {
    await fetchStakingData(ETH);
    subscriber.next(_stakingData);
  }, intervalRange);  

  // clearing interval, when unsubscribe action happens...
  return () => {
    clearInterval(interval);
  };
});

export const toNum = (num, toFixed = 2) => BigNumber(num.toString())
  .dividedBy(10 ** 18)
  .toFixed(toFixed);

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
    return Errors.NOT_INITIALIZED;
  }

  if (stakeAmount < minLockAmount) {
    return Errors.TOO_SMALL;
  }

  if (!stakeDuration) {
    return Errors.WRONG_DURATION;
  }

  if (!isAddress(receiver)) {
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
  if(!Number.isNaN(Number(stakedDough.toString())) && commitment) {
    const k = 56.0268900276223;
    const commitmentMultiplier = (commitment / k) * Math.log10(commitment);
    return toNum(stakedDough * commitmentMultiplier, 4);
  } else {
    return 0;    
  }

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

  merkleTreeDistributor = new ethers.Contract(
    smartcontracts.merkleTreeDistributor,
    MerkleTreeDistributorABI,
    eth.signer || eth.provider,
  );
}

export function initialize(eth) {
  ETH = eth;

  /* eslint-disable no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    try {
      initContracts(eth);

      _stakingData = await fetchStakingData(eth);

      if(observer) {
        observer.unsubscribe();
      }

      observer = observable.subscribe({});

      resolve(_stakingData);
    } catch (error) {
      displayNotification({
        message: error.message,
        type: 'error',
      });

      console.log('error', error);
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
    const kpi = await dough.balanceOf(smartcontracts.kpi_options);

    return totalSupply - treasury - multisig - eDough - kpi;
  } catch (error) {
    return error;
  }
}

export async function fetchAllStakingStats() {
  try {
    const lastId = '';
    let stats = [];

    let response = await fetchStakingStats(null, 1000, lastId);

    while (response.globalStats.length > 0) {
      stats = stats.concat(response.globalStats);
      /* eslint-disable no-await-in-loop */
      response = await fetchStakingStats(
        null, 1000, response.globalStats[response.globalStats.length - 1].id,
      );
      /* eslint-enable no-await-in-loop */
    }

    return stats;
  } catch (error) {
    throw new Error(`fetchAllStakingStats: ${error.message}`);
  }
}

export async function fetchStakingStats(provider, limit, fromId) {
  try {
    const totalSupply = provider ? await calculateDoughTotalSupply(provider) : 0;

    const graphQuery = {
      stakersTrackers: {
        __args: {
          where: { id: 'StakersTrackerID' },
        },
        id: true,
        counter: true,
      },
      globalStats: {
        __args: {
          first: limit,
          orderBy: 'timestamp',
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
    };

    if (fromId) {
      graphQuery.globalStats.__args.where = { id_lt: fromId };
    }

    const response = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/pie-dao/vedough',
      graphQuery,
    );

    return provider ? {
      totalHolders: response.stakersTrackers.length ? response.stakersTrackers[0].counter : 0,
      averageTimeLock: response.globalStats.length
        ? Math.floor(Number(response.globalStats[0].averageTimeLock) / AVG_SECONDS_MONTH) : 0,
      totalStakedDough: response.globalStats.length ? response.globalStats[0].totalDoughStaked : 0,
      totalVeDough: response.globalStats.length ? response.globalStats[0].veTokenTotalSupply : 0,
      totalDough: totalSupply,
    } : response;
  } catch (error) {
    throw new Error(`fetchStakingStats: ${error.message}`);
  }
}

export async function fetchStakingDataGraph(address) {
  try {
    const response = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/pie-dao/vedough',
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
          rewardToken: true
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
    rewards = [];
  }

  if(response.globalStats.length) {
    _stakingData.totalDoughStaked = response.globalStats[0].totalDoughStaked;
    _stakingData.veTokenTotalSupply = response.globalStats[0].veTokenTotalSupply;
  }

  if (staker !== undefined) {
    let leaf = retrieveLeaf(eth.address);

    let isClaimed = leaf ? await merkleTreeDistributor["isClaimed(uint256,uint256)"](
      ethers.BigNumber.from(leaf.windowIndex), 
      ethers.BigNumber.from(leaf.accountIndex))
      : false;

    Object.keys(staker).forEach((key) => {
      if (key !== 'accountLocks') {
        switch(key) {
          case 'accountWithdrawableRewards':
            _stakingData[key] = leaf && !isClaimed? new BigNumber(leaf.amount) : new BigNumber(0);
            break;
          case 'accountWithdrawnRewards':
            _stakingData[key] = new BigNumber(toNum(staker[key]));
            break;
          default:
            _stakingData[key] = new BigNumber(staker[key].toString());
            break;
        }
      } else {
        const locks = [];
        _stakingData.accountAverageDuration = 0;
        _stakingData.accountTokenBalance = new BigNumber('0');
        let locksCounter = 0;

        staker[key].forEach((lock, index) => {
          if (lock.amount.toString() !== '0') {
            // calculating accountAverageDuration / accountTokenBalance,
            // escluding those boosted/duplicated locks...
            // (this is because onchain we remove the old lock,
            // and we create a new 36-months-duration one)
            if (lock.boostedPointer === '') {
              locksCounter += 1;
              _stakingData.accountTokenBalance = _stakingData.accountTokenBalance
                .plus(new BigNumber(lock.amount.toString()));
              _stakingData.accountAverageDuration += Number(lock.lockDuration);
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

        _stakingData.accountAverageDuration = _stakingData.accountAverageDuration
          ? Math.floor((_stakingData.accountAverageDuration / locksCounter) / AVG_SECONDS_MONTH)
          : 0;

        locks.sort((lockA, lockB) => lockB.lockedAt - lockA.lockedAt);

        _stakingData[key] = locks;
      }
    });
  }

  const votingPower = _stakingData.accountVeTokenBalance && _stakingData.veTokenTotalSupply
    ? ((_stakingData.accountVeTokenBalance.times(100)).div(_stakingData.veTokenTotalSupply)).toFixed(3)
    : 0;

  _stakingData.accountVotingPower = Number(votingPower);

  _stakingData.rewards = rewards.sort((rewardA, rewardB) => rewardB.timestamp - rewardA.timestamp);

  try {
    // retrieving the votes in the last month for a given address...
    _stakingData.votes = await fetchLastMonthVoteForVoter(eth.address);
    
    // retrieving the oldest active proposal from piedao.eth space after the 18/10/2021...
    _stakingData.proposals = await fetchLastSnapshots(1, 'active', 'asc', moment("2021-10-18").unix());
    // and if there is at least one active proposal after the 18/10/2021, we add the
    // block infos into that object, so we can easily get the timestamp or any other related info
    if(_stakingData.proposals[0]) {
      _stakingData.proposals[0].block = await eth.provider.getBlock(Number(_stakingData.proposals[0].snapshot));
    }    
  } catch(error) {
    console.error('staking - snapshot error', error);
  }

  _stakingData.address = eth.address;
  _stakingData.hasLoaded = true;
  
  stakingData.set(_stakingData);
  
  return _stakingData;
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
            _stakingData = await fetchStakingData(eth);
            subscription.unsubscribe();

            resolve(_stakingData);
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
            _stakingData = await fetchStakingData(eth);
            subscription.unsubscribe();

            resolve(_stakingData);
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
    if (!sharesTimeLock) {
      initContracts(eth);
    }

    const error = safeFlow(stakeAmount, stakeDuration, receiver, eth);

    if (error) {
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });

      reject(error);
      return;
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
            _stakingData = await fetchStakingData(eth);
            resolve(_stakingData);
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

export async function compound(eth, slice, shouldClaim) {
  /* eslint-disable  no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    const contract = new ethers.Contract(smartcontracts.reward, ERC20, eth.signer || eth.provider);
    const treasury = '0x3bCF3Db69897125Aa61496Fc8a8B55A5e3f245d5';
    const sliceAmount = ethers.utils.parseUnits(slice, 18);

    try {
      if (shouldClaim) {
        await claim(eth);
      }
      const { emitter } = displayNotification(await contract.transfer(treasury, sliceAmount));

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'Slice Compounded!',
              type: 'success',
            });

            subscription.unsubscribe();
            _stakingData = await fetchStakingData(eth);
            resolve(_stakingData);
          },
        });
      });
    } catch (error) {
      displayNotification({
        autoDismiss: 15000,
        message: 'Sorry, an error occurred while compounding your rewards. Please try again later.',
        type: 'error',
      });

      reject(error);
    }
  });
  /* eslint-enable  no-async-promise-executor */
}

export async function claim(eth) {
  /* eslint-disable  no-async-promise-executor */
  return new Promise(async (resolve, reject) => {
    if (!merkleTreeDistributor) {
      initContracts(eth);
    }

    const proof = prepareProofs(eth);

    try {
      const leaf = retrieveLeaf(eth.address);

      if(leaf) {
        const params = {
          windowIndex: leaf.windowIndex,
          amount: ethers.BigNumber.from(leaf.amount),
          accountIndex: leaf.accountIndex,
          account: ethers.utils.getAddress(eth.address.toLowerCase()),
          merkleProof: leaf.proof
        };

        const { emitter } = displayNotification(
          await merkleTreeDistributor["claim((uint256,uint256,uint256,address,bytes32[]))"](params)
        );
  
        emitter.on('txConfirmed', async () => {
          const subscription = subject('blockNumber').subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: 'Pay day baby!',
                type: 'success',
              });
  
              subscription.unsubscribe();
  
              _stakingData = await fetchStakingData(eth);
              resolve(_stakingData);
            },
          });
        });        
      } else {
        reject("cannot claim, address not valid in merkleTree");
      }
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

export function retrieveLeaf(address) {
  const participations = getParticipations();
  return participations[ethers.utils.getAddress(address.toLowerCase())];
}

export function prepareProofs(eth) {
  if (!eth.address) return;

  const leaf = retrieveLeaf(eth.address);

  /* eslint-disable consistent-return */
  return {
    valid: !!leaf,
    proof: leaf ? leaf.proof : null,
  };
  /* eslint-enable consistent-return */
}

export function approveToken(eth, shouldReset = false) {
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
      console.log('shouldReset', shouldReset)
      if (shouldReset) {
        // resetting the approve to zero, before initiating a new approval...
        await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
      }

      await approveMax(smartcontracts.dough, smartcontracts.doughStaking, { gasLimit: 100000 });
      _stakingData.accountDepositTokenAllowance = ethers.constants.MaxUint256;
      resolve(_stakingData);
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
