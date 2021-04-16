<script>
  import images from "../config/images.json";
  export let value;
  export let showLabel;

  $: displayLabel = showLabel || false;
</script>

{#if value === '-' || value === null}
  n/a
{:else}
  {#if value > 0}
    <div class="flex items-center justify-around fitcontent text-green">
      <img src={images.icons.ArrowUp} alt="close" class="h-12px mr-2px" />
      <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
      <!-- <span class="font-thin">{#if displayLabel} 24h{/if}</span> -->
    </div>
  {:else if value == 0}
  <div class="flex  items-center justify-center fitcontent text-black">
  <!-- <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
  <div class="font-thin">{#if displayLabel} 24h{/if}</div> -->
  <div class="ml-2px font-thin">0</div>
  </div>

  {:else}
  <div class="flex items-center justify-center fitcontent text-red">
        <img src={images.icons.ArrowDown} alt="close" class="h-12px mr-2px" />
        <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
        <!-- <span class="font-thin">{#if displayLabel} 24h{/if}</span> -->
    </div>
  {/if}
{/if}
