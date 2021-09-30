<script>  
  // import { getTokenImage } from '../helpers';
  // import {addTokenToMM} from "../helpers/addTokenToMM.js";

  export let address;
  export let symbol;
  export let decimals;
  export let image;
  export let showSymbol;
  export let darkMode;

  const addToken = () => {
    ethereum.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          "type":"ERC20",
          "options":{
            "address": address,
            "symbol": symbol,
            "decimals": decimals,
            "image": image,
          },
        },
        id: Math.round(Math.random() * 100000),
    }, (err, added) => {
      if (added) {
        console.log(`The ${symbol} token has been added to your Metamask!`)
      } else {
        alert('Something went wrong. Is Metamask there?')
      }
    })
  };
</script>

<button on:click={() => addToken()} class="add-dough-metamask m-2 text-center pointer mx-auto object-bottom font-thin" data-aos="fade-up" data-aos-delay="300">
  {#if showSymbol}
    <span class={darkMode ? 'text-black' : 'text-white'}>Add {symbol} to MetaMask 🦊</span>
  {:else}
    <span class={darkMode ? 'text-black' : 'text-white'}>Add to MetaMask 🦊</span>
  {/if}
</button>