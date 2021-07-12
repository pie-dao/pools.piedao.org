<script>
    import Calculator from '../../classes/farming_simulator/Calculator.js';
    import RangeSlider from "svelte-range-slider-pips";
    import images from '../../config/images.json';
    import { formatFiat } from '../../components/helpers.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let calculator = new Calculator();

    export let rewards;
    export let dough_circulation_supply;
    export let estimated_dough_value;
    let total_commitment = 100;

    function applyConfig() {
      let stakedVeDough = 0;

      rewards.forEach(reward => {
        let stakedDoughPercentage = estimated_dough_value * (reward.percentage / 100);
        stakedVeDough += calculator.calculateVeDough(stakedDoughPercentage, reward.months);
      });

      dispatch('applyConfig', {
        rewards: rewards,
        stakedVeDough: stakedVeDough,
        estimated_dough_value: estimated_dough_value
      });
    }

    function resetCommitmentRewards() {
      rewards.forEach(reward => {
        reward.percentage = 0;
      });

      rewards = rewards;
    }

    function commitmentUpdating(event, reward) {
      reward.percentage = event.detail.value;
      rewards = rewards;
    }

    function commitmentChanged(event, reward) {
      total_commitment = rewards.reduce(function (a, b) {
        return {percentage: a.percentage + b.percentage};
      });

      if(total_commitment.percentage > 100) {
        reward.percentage = 100 - (total_commitment.percentage - event.detail.value);
      }

      rewards = rewards;
    }

    function doughChanged(event) {
      estimated_dough_value = event.detail.value;
      estimated_dough_value = estimated_dough_value;

      dispatch('message', {
        rewards: rewards,
        estimated_dough_value: estimated_dough_value
	  	});       
    }
    </script>  
    
  <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px p-6">    
    <div class="w-full">
      <div class="font-bold mb-4 text-base text-center">
        How much of the DOUGH Circulating supply will be staked?
      </div>
    </div>  
    <div class="nowrap swap-from border rounded-20px border-grey p-16px bg-white mb-2">
      <div class="w-full flex flex-row">
        <div class="font-bold mb-4 text-base py-1px text-left w-3/4">
          {formatFiat(estimated_dough_value, ',', '.', '')}
        </div>
        <div class="h-32px flex items-center w-1/4 justify-end">
          <img
            class="token-icon w-30px h-30px"
            src={images.doughtoken}
            alt="ETH"
          />
          <div class="py-2px px-4px">DOUGH</div>
        </div>
      </div>

      <div class="w-full">
        <RangeSlider id="customSlider" values={[estimated_dough_value]} max={dough_circulation_supply} on:stop={(event) => doughChanged(event)}/>
      </div>
    </div> 
    <div class="w-full font-thin text-center mb-6">
      Current Circulating Supply:<br />{formatFiat(dough_circulation_supply,',','.','')} DOUGH
    </div>     

    <div class="w-full">
      <div class="font-bold text-base py-1px text-center">
        Total Staking Commitment
      </div>
      
      <div class="font-thin text-red h-20px text-center">
        {#if total_commitment.percentage < 100}
          You still need to allocate the {100 - total_commitment.percentage}%
        {/if} 
      </div>
             
    </div>    
    <div class="flex flex-col">
      {#each rewards as reward}
      <div class="flex flex-row items-center">
        <div class="w-3/4">
          <RangeSlider values={[reward.percentage]} on:change={(event) => commitmentUpdating(event, reward)} on:stop={(event) => commitmentChanged(event, reward)}/>
        </div>
        <div class="w-1/4 ml-4 py-2">
         {reward.percentage}% &nbsp;{reward.commitment}
        </div>
      </div>
      {/each}    
    </div>
    
    <div class="flex flex-col items-center">
      <button disabled={total_commitment.percentage < 100} 
      class="{total_commitment.percentage < 100 ? 'bg-red text-white m-0 my-4 rounded p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px' : 'bg-black text-white m-0 my-4 rounded p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px'}"
      on:click={applyConfig}>
        Apply
      </button>
      <button class="m-0 rounded min-w-200px w-100pc lg:w-200px lg:min-w-200px" on:click={resetCommitmentRewards}>
        Reset
      </button>     
    </div>
    
  </div>