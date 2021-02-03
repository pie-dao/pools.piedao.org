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
    <div class="flex justify-around items-center fitcontent text-green">
      <img src={images.icons.ArrowUp} alt="close" class="h-12px mr-2px" />
      <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
      <div class="font-thin">{#if displayLabel} 24h{/if}</div>
    </div>
  {:else if value == 0}
  <div class="flex justify-around items-center fitcontent text-black">
  <!-- <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
  <div class="font-thin">{#if displayLabel} 24h{/if}</div> -->
  </div>

  {:else}
  <div class="flex justify-around items-center fitcontent text-red">
        <img src={images.icons.ArrowDown} alt="close" class="h-12px mr-2px" />
        <div class="ml-2px font-thin">{value.toFixed(2)} %</div>
        <div class="font-thin">{#if displayLabel} 24h{/if}</div>
    </div>
  {/if}
{/if}
