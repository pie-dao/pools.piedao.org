<script>  
  import {addTokenToMM} from "../../helpers/addTokenToMM.js";

  export let address;
  export let symbol;
  export let decimals;
  export let image;
  export let showSymbol;
  export let darkMode;

  const addToken = () => {
    addTokenToMM(symbol, address, decimals, image);
  };
</script>

<button on:click={() => addToken()} class="add-dough-metamask m-2 text-center pointer mx-auto object-bottom font-thin" data-aos="fade-up" data-aos-delay="300">
  {#if showSymbol}
    <span class={darkMode ? 'text-black' : 'text-white'}>Add {symbol} to MetaMask 🦊</span>
  {:else}
    <span class={darkMode ? 'text-black' : 'text-white'}>Add to MetaMask 🦊</span>
  {/if}
</button>