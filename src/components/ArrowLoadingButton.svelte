<script>
  import images from '../config/images.json';
  import { stakingDataIntervalRunning, stakingDataInterval } from '../stores/eth/writables.js';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let counter = $stakingDataInterval / 1000;
  let interval = null;
  let isCounting = false;

  $: if ($stakingDataIntervalRunning) {
    if(!isCounting) {
        isCounting = true;

        interval = setInterval(() => {
          if(counter > 0) {
            counter--;
          } else {
            counter = $stakingDataInterval / 1000;
          }
        }, 1000);
      }
  } else {
    isCounting = false;
    counter = $stakingDataInterval / 1000;
    clearInterval(interval);
  }
</script>

<button
on:click={() => {
  dispatch('clicked', {});
}}
class="pointer btnloader p-8px w-68px">
  <span class="flex items-center">
    <div class="w-1/2 font-20px">{counter}s</div>
    <div class="w-1/2 flex items-center ml-1"><img class={isCounting ? "arrowloader animatearrowloader" : "arrowloader"} src={images.reload_arrow} alt="reload arrow" width="20px" height="20px" /></div>            
  </span>
</button>