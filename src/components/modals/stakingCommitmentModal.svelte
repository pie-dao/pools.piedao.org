<script>
    import RangeSlider from "svelte-range-slider-pips";
    import images from '../../config/images.json';
    import { CoinGecko } from '../../stores/coingecko.js';
    import { formatFiat } from '../../components/helpers.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let rewards;
    let circulating_dough = 0;
    let estimated_dough_value = 0;

    CoinGecko.fetchCoinData('piedao-dough-v2').then((doughResponse) => {
      circulating_dough = doughResponse.market_data.circulating_supply;
      estimated_dough_value = circulating_dough / 2;
    });

    function sliderChanged(event, reward) {
      reward.percentage = event.detail.value;
      rewards = rewards;
    }

    function doughChanged(event) {
      estimated_dough_value = event.detail.value;
      estimated_dough_value = estimated_dough_value;
    }
    </script>
    
  <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">    
    <div class="w-full">
      <div class="font-bold mb-4 text-base py-1px text-center">
        How much of the DOUGH Circulating supply will be staked?
      </div>
    </div>  
    <div class="nowrap swap-from border rounded-20px border-grey p-16px bg-white mb-12">
      <div class="w-full flex flex-row">
        <div class="font-bold mb-4 text-base py-1px text-center w-3/4">
          {formatFiat(estimated_dough_value, ',', '.', '')}
        </div>
        <div class="h-32px flex items-center w-1/4">
          <img
            class="token-icon w-30px h-30px"
            src={images.doughtoken}
            alt="ETH"
          />
          <div class="py-2px px-4px">DOUGH</div>
        </div>
      </div>

      <div class="w-full">
        <RangeSlider values={[estimated_dough_value]} max={circulating_dough} on:change={(event) => doughChanged(event)}/>
      </div>
    </div>   

    <div class="w-full">
      <div class="font-bold mb-4 text-base py-1px text-center">
        Total Staking Commitment
      </div>
    </div>    
    <div class="flex flex-col">
      {#each rewards as reward}
      <div class="flex flex-row items-center">
        <div class="w-3/4">
          <RangeSlider values={[reward.percentage]} on:change={(event) => sliderChanged(event, reward)}/>
        </div>
        <div class="w-1/4">
         {reward.percentage}% &nbsp;{reward.commitment}
        </div>
      </div>
      {/each}    
    </div>

    <div class="flex flex-col justify-items-center">
      <button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">
        add
      </button>
      <button class="bg-black rounded w-1/6">Add</button>
    </div>
  </div>