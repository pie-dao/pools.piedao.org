<script>
  import images from '../../config/images.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum, claim } from '../../helpers/staking.js';
  import Proposals from './Proposals.svelte';
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { eth } from "../../stores/eth.js";
  import Experipie from '../../classes/Experipie.js';
  import smartcontracts from '../../config/smartcontracts.json';
  import isEmpty from 'lodash/isEmpty';
  import BigNumber from 'bignumber.js';

  let _data;
  let _staker;
  let claimModal;
  let modalTitle;
  let initialized = false;
  let rewardPie;
  let rewardNAV;

  $: if($eth.provider && !initialized && !isEmpty($piesMarketDataStore)) {
    initialized = true;
    initialize();
  }

  async function initialize() {
    try {
      rewardPie = new Experipie(smartcontracts.reward, $eth.provider);
      await rewardPie.initialize($piesMarketDataStore);     
    } catch(error) {
      console.error(error);
    }
  }

  export const showModal = (data, staker) => {
    _data = data;
    _staker = staker;

    // TODO: remove me
    _data.accountWithdrawableRewards = new BigNumber(123000000000000000000);
    _staker.participation = 1;

    rewardNAV = _data.accountWithdrawableRewards.times(rewardPie.nav);

    if (!_data.accountWithdrawableRewards.eq(0) && _staker.participation == 1) {
      modalTitle = "Pie day is best day";
    } else {
      modalTitle = "You can't claim yet";
    }

    claimModal.open();

    // claim(eth).then(updated_data => {
    //       data = updated_data;
    //       data = data;

    //       dispatch('update', {
    //         data: data,
    //       });          
    //     }).catch(error => {
    //       console.error(error);
    //     });
  };
</script>

<div id="confetti" class="hidden md:block" />

<Modal title={modalTitle} backgroundColor="#f3f3f3" bind:this={claimModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    {#if (!_data.accountWithdrawableRewards.eq(0) && _staker.participation == 1)}
      <p class="pb-2">Like every month, freshly baked<br />rewards for you.</p>

      <div class="text-center mx-auto">
        <img
        class="w-80px h-80px mx-auto"
        src={images.rewardsPie}
        alt="ETH"
      /> 
      </div>    
      <p class="pt-2 font-24px"><b>
        {formatFiat(toNum(_data.accountWithdrawableRewards), ',', '.', '')} SLICE
      </b></p>
      <p class="mb-4">
        {formatFiat(toNum(rewardNAV), ',', '.', '$')} (Net Asset Value)
      </p>

      <button
      disabled={false}
      on:click={() => {}}
      class="pointer flex items-center stakinggradient"
      style="border-radius: 15px !important;"
      >
        <div class="flex items-center pl-6 pr-6 pt-3 pb-3">
          Claim SLICE
        </div>
      </button>      
    {:else}
      <p class="pb-2">Here's what you have to do:</p>

      {#if _data.proposals && _data.proposals.length}
        <Proposals proposals={_data.proposals} />
      {:else}
        <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
          <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
        </div>
      {/if}   
      <p class="pt-2 mb-8">1. Vote on the current proposals<br />to be eligible to claim rewards</p>
    
      <div class="text-center mx-auto">
        <img
        class="w-80px h-80px mx-auto"
        src={images.rewardsPie}
        alt="ETH"
      /> 
      </div>    
      <p class="pt-2 mb-4">2. Claim your rewards!<br />Rewards are calculated and available<br />for claiming at the start of every calendar month.</p>

      <div class="text-center mx-auto">
        <img
        class=" mx-auto pt-4 token-icon"
        src={images.simulator_sword}
        alt="ETH"
      /> 
      </div>    
      <p class="pt-2 pb-2">3. Remember, rewards unclaimed for 3 months<br />are going  to be slashed and redestributed to active participants</p>
    {/if}
  </div>
</Modal>
