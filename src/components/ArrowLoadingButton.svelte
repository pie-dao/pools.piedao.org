<script>
  import images from '../config/images.json';
  import { stakingDataIntervalRunning } from '../stores/eth/writables.js';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let counter = 5;
  let interval = null;
  let isCounting = false;

  $: if ($stakingDataIntervalRunning) {
    if(!isCounting) {
        isCounting = true;

        interval = setInterval(() => {
          if(counter > 0) {
            counter--;
          } else {
            counter = 5;
          }
        }, 1000);
      }
  } else {
    isCounting = false;
    counter = 5;
    clearInterval(interval);
  }
</script>

<button
on:click={() => {
  dispatch('clicked', {});
}}
class="pointer btnloader rounded-20px w-50px">
  <span class="flex">
    <div class="flex intems-center p-1 font-20px">{counter}s</div>
    <img class={isCounting ? "h-20px w-20px arrowloader animatearrowloader" : "h-20px w-20px arrowloader"} src={images.reload_arrow} alt="reload arrow" />            
  </span>
</button>