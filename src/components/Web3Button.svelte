<script>
  import { connectWeb3, eth, connectWeb3Cached } from '../stores/eth.js';
  import { shortenAddress } from "@pie-dao/utils";
  const address = null;
  if(window.localStorage.getItem('address')) {
    connectWeb3Cached();
  }
  const shortAddress = address ? shortenAddress(address) : '';
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
    {#if address}
      <p>{shortAddress}</p>
      🔌
    {:else}
      Connect Web3
    {/if}
  {/if}
</button>