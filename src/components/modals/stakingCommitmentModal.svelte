<script>
    import RangeSlider from "svelte-range-slider-pips";
    import images from '../../config/images.json';
    export let rewards;
    $: rewards;

    function sliderChanged(event, reward) {
      reward.percentage = event.detail.value;
      rewards = rewards;
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
          27,2345,234
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
        <RangeSlider values={[50]}/>
      </div>
    </div>   

    <div class="w-full">
      <div class="font-bold mb-4 text-base py-1px text-center">
        Total Staking Commitment
      </div>
    </div>    
    <div class="flex flex-col">
      {#each rewards as reward}
        <div class="flex flex-row">
          <div class="w-3/4">
            <RangeSlider values={[reward.percentage]} on:change={(event) => sliderChanged(event, reward)}/>
          </div>
          <div class="w-1/4">
            <b>{reward.percentage}%</b> {reward.commitment}
          </div>
        </div>
      {/each}    
    </div>
  </div>