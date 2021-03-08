<script>
  import { formatFiat } from "../helpers.js";
  export let tokenList;
  export let portfolioUSD;
  $: tokens = tokenList || [];
  $: totalVal = portfolioUSD || 0;
</script>

<div class="w-100pc flex flex-col cardbordergradient">
  <div class="w-100pc bg-lightgrey rounded-xl text-black py-8 px-6 flex flex-col items-center">

    <div class="w-100pc font-huge text-left">Portfolio Allocation</div>
    
    {#each tokens as t }
      <a class="flex mt-8 w-100pc" href="#">
        <div class="mr-4 w-60px max-w-60px h-60px max-h-60px">
          <img width="60px" height="60px" on:error={(e) => e.target.src = "http://i.giphy.com/9J7tdYltWyXIY.gif" } src={t.icon} alt={t.symbol} />
        </div>
        <div class="flex flex-col justify-around">
          <span class="flex items-center">
            <span class="text-lg leading-6">{t.symbol}</span>
            {#if t.info.price}
              <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">
                {(totalVal * t.usdValue/ 100)}%
              </span>
            {/if}
          </span>
          <span class="text-sm font-thin">{t.balance.label} {t.symbol} 
            {#if t.info.price}
              • {formatFiat(t.info.price.rate)}
            {/if}
          </span>
        </div>
        <div class="flex flex-col justify-around text-right ml-auto font-thin">
          {#if t.info.price}
              <span class="text-lg leading-6">
                {formatFiat(t.usdValue)}
              </span>

              {#if t.info.price.diff === 0}
                <span class="text-sm px-1 text-black">{t.info.price.diff}%</span>
              {:else if t.info.price.diff > 0}
                <span class="text-sm px-1 text-green">+ {t.info.price.diff}%</span>
              {:else}
                <span class="text-sm px-1 text-red">{t.info.price.diff}%</span>
              {/if}
          {/if}
          
        </div>
      </a>  
    {/each}
    
    <!-- <a href="loadmore" class="font-bold text-center mt-8">Load all assets</a> -->

  </div>
</div>

