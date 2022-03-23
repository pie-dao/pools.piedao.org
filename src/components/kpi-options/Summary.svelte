<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum } from '../../helpers/staking.js';
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import { eth, connectWeb3 } from '../../stores/eth.js';
  import BigNumber from 'bignumber.js';
  import { ethers } from 'ethers';
  import MerkleTreeDistributorABI from '../../abis/MerkleTreeDistributorABI.json';
  import wKpiABI from '../../abis/wKpiABI.json';
  import WkpiJson from '../../config/rewards/wkpi.json';
  import get from 'lodash/get';
  import Modal from '../elements/Modal.svelte';
  import StakingForm from './KPIStakingForm.svelte';
  import * as kpiUtils from './kpiUtils';

  let merkleTreeDistributor;

  let isLoadingTotal = true;
  let isLoading = true;
  let currentAddress;
  let stakedModal;

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

  $: hasClaimableOptions = !kpiOptionsData.claimableKpiOptions.eq(0);
  $: hasWkpiInWallet = !kpiOptionsData.wkpiBalance.eq(0);

  async function init() {
    isLoading = true;

    merkleTreeDistributor = new ethers.Contract(
      smartcontracts.merkleTreeDistributor,
      MerkleTreeDistributorABI,
      $eth.signer || $eth.provider,
    );

    let claimAddress = get(WkpiJson.claims, $eth.address);

    let isClaimed = false;

    let wKpiContract = new ethers.Contract(
      smartcontracts.wkpi,
      wKpiABI,
      $eth.signer || $eth.provider,
    );

    try {
      // move to multicall instantiation
      const wKpiBalance = await wKpiContract.balanceOf($eth.address);
      // kpiOptionsData.wkpiBalance = wKpiBalance;
      kpiOptionsData.wkpiBalance = BigNumber('165400000000000000000');
      console.debug({ kpiOptionsData }, kpiOptionsData.wkpiBalance.eq(0));
    } catch (err) {
      console.warn('Error getting wKPI balance', err);
    }

    if (claimAddress) {
      isClaimed = await merkleTreeDistributor['isClaimed(uint256,uint256)'](
        ethers.BigNumber.from(claimAddress.windowIndex),
        ethers.BigNumber.from(claimAddress.accountIndex),
      );
    }

    if (claimAddress && !isClaimed) {
      kpiOptionsData.claimableKpiOptions = BigNumber(claimAddress.amount);
    } else {
      kpiOptionsData.claimableKpiOptions = BigNumber(0);
    }

    if (claimAddress) {
      kpiOptionsData.estimatedKpiOptions = await kpiUtils.calculateKpiOptions(
        BigNumber(claimAddress.amount),
        $eth.provider,
      );
    }
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
          <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
        </span>
      </div>
    </div>
  </div>

  {#if $eth.address}
    <div class="flow flow-col">
      <button
        disabled={false && (isLoading || !hasClaimableOptions)}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          kpiUtils.claim($eth, init);
        }}>{hasClaimableOptions ? 'Claim' : 'Nothing to Claim'}</button
      >
      <button
        disabled={isLoading || !hasWkpiInWallet}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          stakedModal.open();
        }}>{hasWkpiInWallet ? 'Stake' : 'No wKPI Tokens'}</button
      >
    </div>
  {:else}
    <button
      on:click={() => connectWeb3()}
      class="pointer btn clear stake-button rounded-20px py-15px px-22px mt-6"
      >Connect a Wallet</button
    >
  {/if}
  <button
    on:click={() => kpiUtils.addToken()}
    class="text-center pointer mx-auto object-bottom mb-4 mt-4 font-thin"
  >
    🦊 Add wDOUGH-KPI to MetaMask
  </button>

  <Modal backgroundColor="white" bind:this={stakedModal}>
    <StakingForm slot="content" wkpi={kpiOptionsData.wkpiBalance} />
  </Modal>
</div>
