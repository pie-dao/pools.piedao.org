<script>
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum, fetchStakingStats } from '../../helpers/staking.js';
  import images from '../../config/images.json';
  import { eth, connectWeb3 } from '../../stores/eth.js';
  import BigNumber from 'bignumber.js';
  import WkpiJson from '../../config/rewards/wkpi.json';
  import Modal from '../elements/Modal.svelte';
  import StakingForm from './KPIStakingForm.svelte';
  import * as kpiUtils from './kpiUtils';
  import { isApril3rd } from './timelock'

  let merkleTreeDistributor;
  let currentAddress;
  let stakedModal;
  let stakingStats;
  let isLoadingTotal = true;
  let isLoading = true;

  $: kpiOptionsData = {
    totalDistributedRewards: BigNumber(0),
    estimatedKpiOptions: BigNumber(0),
    claimableKpiOptions: BigNumber(0),
    wkpiBalance: BigNumber(0),
  };

  $: if ($eth.provider) {
    kpiOptionsData.totalDistributedRewards = WkpiJson.totalRewardsDistributed;
    isLoadingTotal = false;
  }

  $: if ($eth.address) {
    if (currentAddress != $eth.address) {
      currentAddress = $eth.address;
      init();
    }
  }

  onMount(async () => {
    try {
      isLoading = true;
      stakingStats = await fetchStakingStats($eth.provider, 1);
    } catch (err) {
      console.warn('Could not fetch staking data');
    } finally {
      isLoading = false;
    }
  });

  async function init() {
    isLoading = true;
    merkleTreeDistributor = kpiUtils.getMerkleTreeDistributorContract($eth);
    await kpiUtils.setWkpiData($eth, kpiOptionsData, merkleTreeDistributor);
    isLoading = false;
  }
</script>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center p-1 font-thin">
        Total Distributed KPI Options
      </div>
    </div>
    <div class="flex nowrap items-center md:items-left p-1">
      <div class="flex-1">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoadingTotal && $eth.provider}
            <div class="md:mr-2">Loading...</div>
          {:else}
            <div class="font-24px">
              {$eth.provider
                ? formatFiat(toNum(kpiOptionsData.totalDistributedRewards), ',', '.', '')
                : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-kpi</span>
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center text-center p-1 font-thin">
        Your Claimable KPI Options
      </div>
    </div>
    <div class="flex nowrap items-center md:items-left p-1">
      <div class="flex-1">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="md:mr-2">Loading...</div>
          {:else}
            <div class="font-24px">
              {$eth.address
                ? formatFiat(toNum(kpiOptionsData.claimableKpiOptions), ',', '.', '')
                : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-kpi</span>
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center p-1 font-thin">Your Estimated Payout</div>
    </div>
    <div class="flex flex-col md:flex-row nowrap items-center md:items-left p-1">
      <div class="flex flex-col md:flex-row w-full md:w-1/3">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="md:mr-2">Loading...</div>
          {:else}
            <div class="font-24px">
              {$eth.address
                ? formatFiat(toNum(kpiOptionsData.estimatedKpiOptions), ',', '.', '')
                : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH | 36 months staked</span>
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center p-1 font-thin">Your wDOUGH-KPI Balance</div>
    </div>
    <div class="flex flex-col md:flex-row nowrap items-center md:items-left p-1">
      <div class="flex flex-col md:flex-row w-full md:w-1/3">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="md:mr-2">Loading...</div>
          {:else}
            <div class="font-24px">
              {$eth.address ? formatFiat(toNum(kpiOptionsData.wkpiBalance), ',', '.', '') : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-KPI</span>
        </span>
      </div>
    </div>
  </div>  
  {#if $eth.address}
    <div class="flow flow-col">
      <button
        disabled={isLoading || kpiOptionsData?.claimableKpiOptions.eq(0)}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          kpiUtils.claim($eth, init);
        }}
        >{isLoading
          ? 'Loading...'
          : !kpiOptionsData?.claimableKpiOptions.eq(0)
          ? 'Claim'
          : 'Nothing to Claim'}</button
      >
      {#if isApril3rd()}
      <button
        disabled={isLoading || kpiOptionsData?.wkpiBalance.eq(0) || !stakingStats?.totalStakedDough}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          stakedModal.open();
        }}
        >{
            (isLoading || !stakingStats?.totalStakedDough)
            ? 'Loading...'
            : !kpiOptionsData?.wkpiBalance.eq(0)
            ? 'Stake'
            : 'No wKPI Tokens'
          }</button
      >
      {/if}
    </div>
  {:else}
    <button
      on:click={() => connectWeb3()}
      class="pointer btn clear stake-button rounded-20px py-15px px-22px mt-6"
      >Connect a Wallet</button
    >
  {/if}
  <button
    on:click={() => kpiUtils.addKPIToken()}
    class="text-center pointer mx-auto object-bottom mb-4 mt-4 font-thin"
  >
    🦊 Add wDOUGH-KPI to MetaMask
  </button>

  <Modal backgroundColor="white" bind:this={stakedModal}>
    <StakingForm slot="content" wkpi={kpiOptionsData.wkpiBalance} {init} {stakingStats} />
  </Modal>

</div>
