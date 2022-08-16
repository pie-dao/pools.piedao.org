<script>
  import images from '../../config/images.json';
  import { getTokenImage } from '../helpers.js';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum } from '../../helpers/staking.js';
  import rewardEscrowABI from '../../config/rewardEscrowABI.json';
  import { subject, eth } from '../../stores/eth.js';
  import { get } from 'svelte/store';
  import smartcontracts from '../../config/smartcontracts.json';
  import { ethers } from 'ethers';
  import displayNotification from '../../notifications.js';
  import Modal from '../../components/elements/Modal.svelte';
  import InfoModal from '../../components/modals/infoModal.svelte';
  import StakedModal from '../../components/elements/StakedModal.svelte';
  import ClaimEdoughModal from '../../components/elements/ClaimEdoughModal.svelte';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';

  let rewardEscrowContract;
  let doughInEscrow = BigNumber(0);
  let veDoughInEscrow = BigNumber(0);
  let claimableDoughInEscrow = BigNumber(0);
  let escrowEntries = 'n/a';
  let accountSchedule = [];
  let stakedModal = null;
  let claimModal = null;

  export let pools;

  let isClaiming = false;
  let isStaking = false;
  let modal = null;
  let modal_content_key = 'vesting_ve_dough';

  $: if ($eth.address || $eth.currentBlockNumber) {
    $eth.address || !$eth.signer;
    fetchRewardEscrowData();
  }

  function mapAccountSchedule(accountSchedule) {
    let mappedAccountSchedule = [];

    for (var i = 0; i < accountSchedule.length / 2; i += 2) {
      if (!accountSchedule[i].eq(0) && !accountSchedule[i + 1].eq(0)) {
        mappedAccountSchedule.push({
          timestamp: accountSchedule[i],
          amount: accountSchedule[i + 1],
        });
      }
    }

    return mappedAccountSchedule;
  }

  async function fetchRewardEscrowData() {
    try {
      // const address = '0x5ce583b0431794f65ee97fbd6fffacf2adad344c';
      // const address = '0xc96265c36F6D77747f9c259946a1eF55FcE946b7';
      const address = $eth.address;

      if (!address) {
        return;
      }

      const { provider, signer } = get(eth);
      rewardEscrowContract = new ethers.Contract(
        smartcontracts.eDOUGH,
        rewardEscrowABI,
        signer || provider,
      );

      doughInEscrow = await rewardEscrowContract.totalEscrowedAccountBalance(address);
      accountSchedule = mapAccountSchedule(await rewardEscrowContract.checkAccountSchedule(address));

      let vestingEntries = (await rewardEscrowContract.numVestingEntries(address)).toString();
      escrowEntries = {
        vesting: accountSchedule.length,
        claimed: vestingEntries - accountSchedule.length,
      };

      let now = moment().unix();
      veDoughInEscrow = BigNumber(0);
      claimableDoughInEscrow = BigNumber(0);

      accountSchedule.forEach((schedule) => {
        if (now >= moment(moment.unix(schedule.timestamp.toString())).subtract(26, 'week').unix()) {
          veDoughInEscrow = veDoughInEscrow.plus(schedule.amount.toString());
        }

        if (now >= moment(moment.unix(schedule.timestamp.toString())).unix()) {
          claimableDoughInEscrow = claimableDoughInEscrow.plus(schedule.amount.toString());
        }        
      });     
    } catch(error) {
      console.error(error);
    }
  }

  async function stake() {
    isStaking = true;

    try {
      const { emitter } = displayNotification(await rewardEscrowContract.migrateToVeDOUGH());

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'You staked for veDOUGH',
              type: 'success',
            });

            subscription.unsubscribe();

            isStaking = false;
            fetchRewardEscrowData();
            stakedModal.showModal(toNum(veDoughInEscrow), '36');
          },
        });
      });
    } catch (error) {
      console.error(error);
      isStaking = false;

      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });
    }
  }

  async function claim() {
    claimModal.showModal(claimableDoughInEscrow);
  }
</script>

<Modal title="Get veDOUGH" backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <InfoModal description_key={modal_content_key} />
  </span>
</Modal>

<StakedModal bind:this={stakedModal} />

<ClaimEdoughModal
  bind:this={claimModal}
  {rewardEscrowContract}
  on:claimed={fetchRewardEscrowData}
/>

<span class="-mt-20px">
  <!-- <a class="" href="#/farms" target="_blank"><img width="20px" height="20px" class="ml-auto relative top-40px right-20px" src={images.extLink} alt="external link icon" /></a> -->

  <div class="bg-lightgreen rounded-xl text-black pt-8 pb-2 md:py-8 px-2 md:px-6">
    <div class="font-huge text-center">Farm Positions</div>

    <div class="flex flex-row">
      <div
        class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 ml-1 ml-2 w-full"
      >
        <div class="flex items-center mr-2 text-little md:text-xs">
          <img class="" width="40px" height="40px" src={images.eDough} alt="dough" />
        </div>
        <div class="flex flex-col justify-around w-full text-little md:text-base">
          <span class="font-thin opacity-80">Balance Escrowed</span>
          <span class="font-bold leading-6"
            >{formatFiat(toNum(doughInEscrow), ',', '.', '') || 0} eDOUGH</span
          >
        </div>
      </div>
    </div>     

    <div class="flex">
      <div
        class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 ml-1 md:mr-2 w-1/2"
      >
        <div class="flex items-center mr-4 text-l md:text-xl hidden md:block">
          🧮
          <!-- <img class="" width="40px" height="40px" src={images.doughtoken} alt="token name" /> -->
        </div>
        <div class="flex flex-col justify-around text-little md:text-xs">
          <span class="font-thin opacity-80">Vesting Entries</span>
          <span class="font-bold leading-6">{escrowEntries.vesting || 0}</span>
        </div>
      </div>

      <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 mr-1 ml-2 w-1/2">
        <div class="flex items-center mr-2 text-l md:text-xl hidden md:block">
          💰
          <!-- <img class="" width="40px" height="40px" src={images.doughtoken} alt="token name" /> -->
        </div>
        <div class="flex flex-col justify-around text-little md:text-xs">
          <span class="font-thin opacity-80">Claimed/Staked Entries</span>
          <span class="font-bold leading-6">{escrowEntries.claimed || 0}</span>
        </div>
      </div>
    </div>   

    <div class="flex flex-row">
      <div
        class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 ml-1 ml-2 w-full"
      >
        <div class="flex items-center mr-2 text-little md:text-xs">
          <img class="" width="40px" height="40px" src={images.doughtoken} alt="dough" />
        </div>
        <div class="flex flex-col justify-around w-full text-little md:text-base">
          <span class="font-thin opacity-80">Claim Vested DOUGH</span>
          <span class="font-bold leading-6"
            >{formatFiat(toNum(claimableDoughInEscrow), ',', '.', '') || 0} DOUGH</span
          >
        </div>

        {#if !claimableDoughInEscrow.eq(0)}
          <button
            disabled={isClaiming}
            class="flex items-center bg-black rounded-xl pointer px-4 py-2 text-white text-little md:text-xs"
            on:click={() => {
              claim();
            }}>Claim</button
          >
        {/if}
      </div>
    </div>

    <div class="flex flex-row">
      <div
        class="flex flex-col items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 ml-1 md:ml-2 w-full"
      >
        <div class="flex flex-row w-full text-little md:text-base">
          <div class="flex items-center mr-2">
            <img class="" width="50px" height="50px" src={images.veDough} alt="ve-dough" />
          </div>
          <div class="flex flex-col justify-around w-full text-little md:text-base">
            <div class="font-thin text-left flex items-center">
              <span class="float-left">Bridge to veDOUGH</span>
              <img
                on:click={() => modal.open()}
                class="token-icon w-18px h-18px pl-4px pointer"
                src={images.simulator_info}
                alt="ETH"
              />
            </div>
            <span class="font-bold leading-6"
              >{formatFiat(toNum(veDoughInEscrow), ',', '.', '') || 0} veDOUGH</span
            >
          </div>

          {#if !veDoughInEscrow.eq(0)}
            <button
              disabled={isStaking}
              on:click={() => {
                stake();
              }}
              class="pointer flex items-center stakinggradient w-180px justify-center"
            >
              <div class="flex items-center p-1 md:p-2">
                <div class="mr-4px md:mr-8px text-little md:text-xs">Stake</div>
                <img
                  class="w-20px h-20px md:w-30px md:h-30px"
                  src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                  alt="ETH"
                />
              </div>
            </button>
          {/if}
        </div>
        <div class="flex flex-row w-full text-center justify-center pt-5">
          <a href={`#/dough-staking-campaign`} class="font-bold pink leading-6 text-center"
            >💰 Earn Governance Rewards 💰
          </a>
        </div>
      </div>
    </div>

    {#if accountSchedule.length}
      <div class="flex flex-row text-little md:text-base">
        <div
          class="flex text-center items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-4 ml-1 ml-2 w-full"
        >
          <div class="overflow-y-scroll max-h-100 w-full">
            <table class="w-full overflow-x-scroll md:min-w-400px">
              <thead>
                <tr>
                  <th class="sticky_table_header gray_border p-2 border-r-2 w-1/5 text-left"
                    >Amount</th
                  >
                  <th class="sticky_table_header gray_border p-2 border-r-2 w-2/5 text-left"
                    >Get DOUGH</th
                  >
                  <th class="sticky_table_header gray_border p-2 w-2/5 text-left">💰 Get veDOUGH</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each accountSchedule as schedule}
                  <tr class="gray_border border-t-2 w-full">
                    <td class="gray_border p-2 border-r-2 min-w-1/5 w-1/5 text-left">
                      {formatFiat(toNum(schedule.amount), ',', '.', '')}
                    </td>

                    {#if moment().unix() >= moment(moment.unix(schedule.timestamp.toString())).unix()}
                      <td class="gray_border p-2 font-thin border-r-2 min-w-2/5 w-2/5 text-left">
                        <img
                          class="float-left mr-1 mt-1 hidden md:block"
                          width="20px"
                          height="20px"
                          src={images.doughtoken}
                          alt="token name"
                        />
                        <span class="w-90px">Ready</span>
                      </td>
                    {:else}
                      <td class="gray_border p-2 border-r-2 min-w-2/5 w-2/5 font-thin text-left">
                        <img
                          class="float-left mr-1 mt-1 hidden md:block"
                          width="20px"
                          height="20px"
                          src={images.calendar}
                          alt="token name"
                        />
                        <span class="w-90px"
                          >{moment(moment.unix(schedule.timestamp.toString())).format(
                            'DD/MM/YY',
                          )}</span
                        >
                      </td>
                    {/if}

                    {#if moment().unix() >= moment(moment.unix(schedule.timestamp.toString()))
                        .subtract(26, 'week')
                        .unix()}
                      <td class="gray_border p-2 text-left">
                        <img
                          class="float-left mr-1 mt-1 hidden md:block"
                          width="20px"
                          height="20px"
                          src={images.gem_stone}
                          alt="token name"
                        />
                        <span class="w-90px">Stake & Earn</span>
                      </td>
                    {:else}
                      <td class="gray_border p-2 font-thin text-left">
                        <img
                          class="float-left mr-1 mt-1 hidden md:block"
                          width="20px"
                          height="20px"
                          src={images.calendar}
                          alt="token name"
                        />
                        <span class="w-90px"
                          >{moment(moment.unix(schedule.timestamp.toString()))
                            .subtract(26, 'week')
                            .format('DD/MM/YY')}</span
                        >
                      </td>
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}

    {#if pools.length > 0}
      {#each pools as stakingPool}
        <a href={`#/staking/${stakingPool.slug}`}>
          <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-2 md:mt-4">
            <div class="flex items-center mr-4">
              {#each stakingPool.containing as asset, i}
                <img
                  class={i === 0 ? 'z-10' : '-ml-20px'}
                  width="40px"
                  height="40px"
                  src={getTokenImage(asset.address)}
                  alt="token name"
                />
              {/each}
            </div>
            <div class="flex flex-col justify-around">
              <span class="md:text-lg font-bold leading-6">{stakingPool.name}</span>
              <span class="text-xs font-thin opacity-80">Staked</span>
              <span class="text-xs font-thin opacity-80">Rewards</span>
            </div>
            <div class="flex flex-col justify-around text-right ml-auto mt-auto font-thin">
              <!-- <span><span class="bg-darkpurple font-bold text-white px-5px py-1px roundedxs text-xs">55.30% APY</span></span> -->
              <span class="text-xs font-thin opacity-80"
                >{stakingPool.userDeposited} {stakingPool.stakingTokenSymbol}</span
              >
              <span class="text-xs font-thin opacity-80">{stakingPool.userUnclaimed} DOUGH</span>
            </div>
          </div>
        </a>
      {/each}
    {/if}
  </div>
</span>
