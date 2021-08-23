<script>
  import { approve, approveMax, connectWeb3, subject, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import veDoughABI from '../abis/veDoughABI.json';
  import smartcontracts from '../config/smartcontracts.json';
  import images from '../config/images.json';
  import PartecipationJson from '../config/rewards/test.json';
  import displayNotification from '../notifications';
  import { isAddress } from '@pie-dao/utils';
  import { createParticipationTree } from '../classes/MerkleTreeUtils';
  import { subgraphRequest } from '../helpers/subgraph.js';
  import { formatFiat } from '../components/helpers.js';
  import { toNum } from '../helpers/staking.js';

  import Modal from '../components/elements/Modal.svelte';
  let modalinfo;

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
      isLoading = false;
    } catch (e) {
      console.log('Something went wrong...', e);
    }
  }
</script>

<Modal title="Slashed Rewards" backgroundColor="#f3f3f3" bind:this={modalinfo}>
  <span slot="content" class="p-4 font-thin">
    <strong>What's that?</strong><br />
    If you don't partecipate, you're a looser.<br />
    If you're a looser, we'll slash you.<br /><br />

    <strong>why?</strong><br />
    Sorry man.<br />
    This is your own fault.<br />
  </span>
</Modal>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- PAST REWARDS -->
      <div class="flex flex-col items-center w-full pb-6 bg-lightyellow rounded-16 mt-6">
        <div class="font-huge text-center mt-6">Rewards History</div>
        {#if data.rewards && data.rewards.length > 0}
          {#each data.rewards as reward, id}
            {#if reward.type != 'distributed'}
              <div
                on:click={() => {
                  reward.type == 'slashed' ? modalinfo.open() : null;
                }}
                class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px"
              >
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">
                    {new Date(reward.timestamp * 1000).toDateString()}
                  </div>
                  <a class="" href="https://rinkeby.etherscan.io/tx/{reward.id}" target="_blank"
                    ><img
                      width="20px"
                      height="20px"
                      src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg"
                      alt="external link icon"
                    /></a
                  >
                </div>
                <div class="flex nowrap items-center justify-between p-1">
                  <span class="sc-iybRtq gjVeBU">
                    <div class="font-24px">{formatFiat(toNum(reward.amount), ',', '.', '')}</div>
                    <img
                      class="h-auto w-24px mx-5px"
                      src={images.rewardsPie}
                      alt="rewardspie token"
                    />
                  </span>
                  <div class="flex items-center justify-between">
                    <img
                      class="h-auto w-24px mx-5px"
                      src={reward.type == 'claimed' ? images.claimed : images.slashed}
                      alt="clamed icon"
                    />
                    <span>{reward.type}</span>
                  </div>
                </div>
              </div>
            {/if}
          {/each}
        {:else}
          Insert placeholder
        {/if}

        <a class="pt-6"href="#/new_staking">
          go back on Staking page
        </a>
      </div>
      <!-- END PAST REWARDS -->
    </div>
  </div>
</div>
