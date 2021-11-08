<script>
  import {afterUpdate} from "svelte";
  import { formatFiat } from "../helpers.js";

  export let tokenList;

  $: tokens = tokenList || [];
  $: totalVal = 0;
  afterUpdate(() => {
    totalVal = $$restProps.totalVal;
  });
</script>

<div class="bg-purple rounded-xl text-white py-8 px-6">
  <div class="font-huge">Your holdings</div>

  {#if !tokens.length }
    Loading
  {:else}
  
    {#each tokens as token}
      {#if token.balance && token.balance.number > 0 }
      <a class="flex mt-8" href={token.address != "0x1083d743a1e53805a95249fef7310d75029f7cd6" ? `#/pie/${token.address}` : '#/slice'}>
          <div class="mr-4 w-60px max-w-60px h-60px max-h-60px"><img width="60px" height="60px" src={token.icon} alt={token.symbol} /></div>
          <div class="flex flex-col justify-around">
            <span class="flex items-center">
              <span class="text-lg leading-6">{token.symbol}</span>
              <span class="bg-black opacity-60 px-5px py-1px roundedxs text-xs ml-2">{((token.usdValue * 100) / totalVal).toFixed(2)}%</span>
            </span>
            <span class="text-sm font-thin">{token.balance.label} {token.symbol} 
              {#if token.market_data && token.market_data.current_price }
              • ${token.market_data.current_price}
              {/if}
            </span>
          </div>
          <div class="flex flex-col justify-around text-right ml-auto font-thin">
            <span class="text-lg leading-6">{formatFiat(token.usdValue)}</span>
            <span class="text-sm px-1 text-green">{token.change.toFixed(2)}%</span>
          </div>
        </a>
      {/if}
    {/each}

  {/if}  
  

</div>

