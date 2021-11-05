<script>
  import images from '../../config/images.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum, claim, retrieveLeaf } from '../../helpers/staking.js';
  import Proposals from './Proposals.svelte';
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { eth } from "../../stores/eth.js";
  import Experipie from '../../classes/Experipie.js';
  import smartcontracts from '../../config/smartcontracts.json';
  import isEmpty from 'lodash/isEmpty';
  import { claimModalIsOpen, stakingData } from '../../stores/eth/writables.js';
  import BigNumber from 'bignumber.js';
  import { onMount } from 'svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let _staker = {participation: 0};
  let claimModalTitle;
  let claimModal;
  let initialized = false;
  let rewardPie;
  let rewardNAV;
  let hasClaimed = false;
  let buttonText = "Claim SLICE";

  $: if($eth.provider && !initialized && !isEmpty($piesMarketDataStore)) {
    initialized = true;
    initialize();
  }

  onMount(async() => {
    if($claimModalIsOpen) {
      await initialize();
      showModal($stakingData);
    }
  });

  const modalChanged = (event, force = true) => {
    $claimModalIsOpen = event.detail.data.isOpen;
  }

  async function initialize() {
    try {
      rewardPie = new Experipie(smartcontracts.reward, $eth.provider);
      await rewardPie.initialize($piesMarketDataStore);     
    } catch(error) {
      console.error(error);
    }
  }

  export const showModal = (data) => {
    $stakingData = data;

    if(retrieveLeaf($stakingData.address)) {
      _staker.participation = 1;
    }

    // TODO: remove me
    // $stakingData.accountWithdrawableRewards = new BigNumber(123000000000000000000);
    // _staker.participation = 1;

    rewardNAV = $stakingData.accountWithdrawableRewards.times(rewardPie.nav);

    if (!$stakingData.accountWithdrawableRewards.eq(0) && _staker.participation == 1) {
      claimModalTitle = "Pie day is best day";
    } else {
      claimModalTitle = "You can't claim yet";
    }

    claimModal.open();
  };

  function claimRewards() {
    buttonText = "Claiming";

    let interval = setInterval(() => {
      let occurrences = buttonText.split('.').length - 1;

      if (occurrences < 3) {
        buttonText += '.';
      } else {
        buttonText = 'Claiming';
      }
    }, 1000);

    claim($eth).then(updated_data => {
      // $stakingData = updated_data;
      // $stakingData = $stakingData;

      // dispatch('update', {
      //   data: $stakingData,
      // });

      clearInterval(interval);
      buttonText = "Claimed";
      hasClaimed = true;
    }).catch(error => {
      clearInterval(interval);
      buttonText = "Claim SLICE";
      console.error(error);
    });    
  }
</script>

<div id="confetti" class="hidden md:block" />

<Modal modalIsOpen={$claimModalIsOpen} on:modalChanged={modalChanged} title={claimModalTitle} backgroundColor="#f3f3f3" bind:this={claimModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    {#if (!$stakingData.accountWithdrawableRewards.eq(0) && _staker.participation == 1)}
      <p class="pb-2">Like every month, freshly baked<br />rewards for you.</p>

      <div class="text-center mx-auto">
        <img
        class="w-80px h-80px mx-auto"
        src={images.rewardsPie}
        alt="ETH"
      /> 
      </div>    
      <p class="pt-2 font-24px"><b>
        {formatFiat(toNum($stakingData.accountWithdrawableRewards), ',', '.', '')} SLICE
      </b></p>
      <p class="mb-4">
        {formatFiat(toNum(rewardNAV), ',', '.', '$')} (Net Asset Value)
      </p>

      <button
      disabled={hasClaimed}
      on:click={() => {claimRewards()}}
      class="pointer flex items-center stakinggradient"
      style="border-radius: 15px !important;"
      >
        {#if buttonText == "Claimed"}
          <svg width="20" class="ml-4 mr-2" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.0854 0.00229427C16.6112 0.0278993 16.1653 0.243858 15.8425 0.604302L7.51826 9.5518L2.9798 5.72727C2.60327 5.41108 2.12082 5.26268 1.6386 5.31471C1.15637 5.36673 0.713854 5.61493 0.408406 6.00469C0.102958 6.39446 -0.0404053 6.89387 0.00985482 7.39305C0.0601149 7.89224 0.299881 8.35032 0.676408 8.66651L6.51479 13.577C6.86936 13.8753 7.31912 14.025 7.77518 13.9966C8.23124 13.9682 8.66041 13.7637 8.97785 13.4235L18.4652 3.22481C18.7259 2.95508 18.9016 2.60995 18.9691 2.23486C19.0366 1.85976 18.9928 1.47228 18.8435 1.12345C18.6941 0.774628 18.4462 0.480813 18.1324 0.280682C17.8186 0.0805498 17.4536 -0.0165027 17.0854 0.00229427V0.00229427Z" fill="black"/>
          </svg>
          <div class="flex items-center pr-6 pt-3 pb-3">
            {buttonText}
          </div>
        {:else}
        <div class="flex items-center pl-6 pr-6 pt-3 pb-3">
          {buttonText}
        </div>
        {/if}
      </button>      
    {:else}
      <p class="pb-2">Here's what you have to do:</p>

      {#if $stakingData.votes.length == 0}
        {#if $stakingData.proposals && $stakingData.proposals.length}
          <Proposals proposals={$stakingData.proposals} />
        {:else}
          <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
            <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
          </div>
        {/if}   
        <p class="pt-2 mb-8">1. Vote on the current proposals<br />to be eligible to claim rewards</p>
      {:else}
        <p class="pt-2 mb-8">1. You voted already, so you just need to wait!<br />
          The SLICE reward distribution will happen every first week of the month.</p>
      {/if}
    
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
