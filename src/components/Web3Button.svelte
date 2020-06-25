<script>
  import { connectWeb3, eth } from '../stores/eth.js';
</script>

<button
  class="btn connect-button-container"
  on:click={connectWeb3}
  role="button"
  tabIndex="-100"
>
  {#if $eth.address}
    <p>{$eth.shortAddress}</p>
    <div class="icon-container">
      <div class="image-container">
        {@html $eth.icon}
      </div>
    </div>
  {:else}
    Connect Web3
  {/if}
</button>