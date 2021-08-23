<script>
  import { subject, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import veDoughABI from '../abis/veDoughABI.json';
  import smartcontracts from '../config/smartcontracts.json';
  import images from '../config/images.json';
  import PartecipationJson from '../config/rewards/test.json';
  import displayNotification from '../notifications';
  import { createParticipationTree } from '../classes/MerkleTreeUtils';
  import { subgraphRequest } from '../helpers/subgraph.js';
  import { formatFiat } from '../components/helpers.js';
  import { toNum } from '../helpers/staking.js';

  $: isLoading = true;

  let data = {
    totalStaked: BigNumber(0),
    veTokenTotalSupply: BigNumber(0),
    accountVeTokenBalance: BigNumber(0), //amount of veDOUGH you have
    accountWithdrawableRewards: BigNumber(0), //amount is in reward Pie
    accountWithdrawnRewards: BigNumber(0),
    accountDepositTokenBalance: BigNumber(0),
    accountLocks: [],
    rewards: [],
  };

  let receiver = '';
  let sharesTimeLock = false;
  let veDOUGH = false;

  function calculateStakingEnds(lock) {
    let startDate = new Date(lock.lockedAt * 1000);
    let lockDuration = lock.lockDuration / 60;

    //startDate.setMonth(startDate.getMonth() + lockDuration);

    // TODO: remove this line, and use the previous one...
    startDate.setMinutes(startDate.getMinutes() + lockDuration);

    return startDate;
  }

  function getLockStatus(lock) {
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

  function didLockExpired(lock) {
    let endDate = calculateStakingEnds(lock);
    let nowDate = new Date();
    return nowDate > endDate;
  }

  async function fetchStakingDataGraph(address) {
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

  const fetchStakingData = async () => {
    let response = null;
    let staker = null;
    let rewards = null;

    // this is a fallback in case the graph is not working...
    try {
      // using graph...
      response = await fetchStakingDataGraph($eth.address);
      console.log('response for ' + $eth.address.toLowerCase(), response);
      rewards = response.rewards;
      staker = response.stakers[0];
    } catch (error) {
      console.error(error);
      // using onchain as fallback...
      staker = await sharesTimeLock.getStakingData($eth.address);
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

  $: if ($eth.address && isLoading) {
    initialize();
  }

  async function initialize() {
    try {
      sharesTimeLock = new ethers.Contract(
        smartcontracts.doughStaking,
        sharesTimeLockABI,
        $eth.signer || $eth.provider,
      );

      veDOUGH = new ethers.Contract(
        smartcontracts.veDOUGH,
        veDoughABI,
        $eth.signer || $eth.provider,
      );

      await fetchStakingData();

      receiver = $eth.address;
      console.log(prepareProofs());
      isLoading = false;
    } catch (e) {
      console.log('Something went wrong...', e);
    }
  }

  function prepareProofs() {
    if (!$eth.address) return;
    const merkleTree = createParticipationTree(PartecipationJson);

    console.log('merkleTree', merkleTree);
    const leaf = merkleTree.leafs.find(
      (item) => item.address.toLowerCase() === $eth.address.toLowerCase(),
    );

    return {
      valid: leaf ? true : false,
      proof: leaf ? merkleTree.merkleTree.getProof(leaf.leaf) : null,
    };
  }

  async function boostToMax(id) {
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

  async function unstakeDOUGH(id, lockAmount) {
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

  function calculateVeDough(stakedDough, commitment) {
    let k = 56.0268900276223;
    let commitmentMultiplier = (commitment / k) * Math.log10(commitment);
    let veDOUGH = stakedDough * commitmentMultiplier;
    return toNum(veDOUGH);
  }
</script>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- YOUR STAKING -->
      <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
        <div class="font-huge text-center mt-6">Your Staking</div>

        {#if data.accountLocks && data.accountLocks.length > 0}
          {#each data.accountLocks as lock, id}
            <!-- Let's show just the normal stakes, and the boosted ones. The stakes having a boostedPointer are obsolete stakes, so we won't show them -->
            {#if lock.boostedPointer == ''}
              <div
                class={lock.ejected
                  ? 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px opacity-60'
                  : 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px'}
              >
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Your total staked DOUGH</div>
                  <div class="flex items-center">
                    <div class="font-thin mr-2">Staking ends:</div>
                    <span>{calculateStakingEnds(lock).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="flex nowrap items-center p-1 justify-between mt-2">
                  <div class="grid grid-flow-col grid-cols-1 grid-rows-2">
                    <div class="sc-iybRtq gjVeBU">
                      <div class="font-24px">{formatFiat(toNum(lock.amount), ',', '.', '')}</div>
                      <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                      <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
                    </div>
                    <div class="sc-iybRtq gjVeBU float-left">
                      <div class="font-24px">
                        {formatFiat(
                          calculateVeDough(lock.amount, lock.lockDuration / 60),
                          ',',
                          '.',
                          '',
                        )}
                      </div>
                      <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                      <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
                    </div>
                  </div>
                  {#if lock.lockDuration / 60 != 36}
                    {#if !lock.boosted}
                      <div
                        on:click={() => {
                          boostToMax(id);
                        }}
                        class="flex items-center cardbordergradient -mr-2 pointer"
                      >
                        <div class="flex items-center p-2">
                          <div class="mr-8px">Boost to Max</div>
                          <img
                            class="w-30px h-30px"
                            src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                            alt="ETH"
                          />
                        </div>
                      </div>
                    {:else}
                      <div class="flex items-center cardbordergradient -mr-2 pointer opacity-30">
                        <div class="flex items-center p-2">
                          <div class="mr-8px">Already Boosted</div>
                          <img
                            class="w-30px h-30px"
                            src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                            alt="ETH"
                          />
                        </div>
                      </div>
                    {/if}
                  {/if}
                </div>
                <div class="mt-2 flex justify-start opacity-30 pointer">
                  <span>{getLockStatus(lock)}</span>
                </div>
                {#if !lock.withdrawn && !lock.ejected}
                  {#if didLockExpired(lock)}
                    <div
                      on:click={() => {
                        unstakeDOUGH(id, toNum(lock.amount));
                      }}
                      class="mt-2 flex justify-end pointer"
                    >
                      <span>Unstake</span>
                    </div>
                  {:else}
                    <div class="mt-2 flex justify-end opacity-30 pointer"><span>Unstake</span></div>
                  {/if}
                {/if}
              </div>
            {/if}
          {/each}
        {:else}
          Insert placeholder No locks
        {/if}

        <a class="pt-6"href="#/new_staking">
          go back on Staking page
        </a>
      </div>
      <!-- END YOUR STAKING -->
    </div>
  </div>
</div>
