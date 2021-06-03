<script>
    import RangeSlider from "svelte-range-slider-pips";
    export let rewards;
    </script>
    
  <div class="liquidity-container flex-col justify-items-center bg-grey-243 rounded-4px lg:px-4 lg:pb-4">
    {#each rewards as reward}
    <RangeSlider values={[reward.percentage]}/>
    {reward.commitment}
    {/each}
  </div>