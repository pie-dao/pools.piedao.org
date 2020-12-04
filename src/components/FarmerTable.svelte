<script>

  import isNull from 'lodash/isNull';
  import filter from 'lodash/filter';
  import sortBy from 'lodash/sortBy';
  import {
    getTokenImage,
    formatFiat,
    calculateAPRBalancer,
    calculateAPRUniswap
  } from "../components/helpers.js";

  import { farming } from '../stores/eth/writables.js';
  import incentivizedPools from '../config/farmingConf.js';

  $: pools = sortBy(filter(incentivizedPools.map( p => {
    if( p.deprecated === false )
      return p;
    else 
      return null;
  }), (o) => isNull(o) ? false : true), ['sortFactor']);
</script>

<div class="content flex flex-col spl">

<div class="flex flex-col w-100pc breakdown-table pt-2px">

  <div class="flex w-100pc min-w-1140px min-h-50px justify-center items-center py-1 mb-2 negativetop">

    <div class="font-thin text-left px-1pc items-stretch md:block w-20pc">
      Asset Name
    </div>
    <div class="font-thin text-center px-1pc block w-14pc md:block">
      DEX
    </div>
    <div class="font-thin text-center px-1pc w-8pc">
      Weights  
    </div>
    <div class="font-thin text-center px-1pc w-10pc">
      W Rewards
    </div>
    <div class="font-thin text-center px-1pc w-14pc">
      APR (unstable)
    </div>
    <div class="font-thin text-center px-1pc w-16pc">
      Liquidity
    </div>
    <div class="font-thin text-center w-8pc px-1pc">
    </div>
    <div class="font-thin ext-center px-1pc w-10pc">
    </div>
  </div>

  {#each pools as pool}
  
      <div class="flex w-100pc min-w-1140px min-h-50px justify-center items-center py-3 negativetop thinborder">
      <div class="text-center px-1pc thinborderight items-stretch md:block w-20pc">
          {#each pool.containing as coins}
          <img
              class="inline icon"
              src={coins.icon}
              alt={pool.symbol} />
              ({coins.symbol})
              &nbsp;
          {/each}
      </div>

      <div class="text-center px-1pc thinborderight block w-14pc md:block">
          {#if pool.type === 'UniswapV2'}
          🦄 Uniswap V2
          {/if}
          {#if pool.type === 'Balancer'}
          <span>⚖️ Balancer</span>
          {/if}
          {#if pool.type === 'PieDAO'}
          <span>🥧 PieDAO</span>
          {/if}
          
      </div>

      <div class="text-center px-1pc thinborderight w-8pc">
          {pool.weights}
      </div>

      <div class="text-center px-1pc thinborderight w-10pc">
          {pool.weeklyRewards}
      </div>
      
      <div class="text-center px-1pc thinborderight w-14pc">
        {#if $farming[pool.addressUniPoll] && $farming[pool.addressUniPoll].apr}
          {$farming[pool.addressUniPoll].apr}
        {:else}
          {#if pool.contractType === 'Geyser'}
            See stake
            page
          {:else}
            n/a
          {/if}
        {/if}
      </div>

      <div class="text-center px-1pc thinborderight w-16pc">
        {#if $farming[pool.addressUniPoll]}
          {formatFiat($farming[pool.addressUniPoll].totalLiquidity.toFixed(2))}
        {:else}
          n/a
        {/if}
      </div>
      
      <div class="text-center thinborderight w-8pc px-1pc">
        <a href="#/stake">
          {#if pool.deprecated}
            <button class="table-btn min-w-70px">
              Unstake
            </button>
          {:else}
            <button class="table-btn highlight-box min-w-70px">
              Stake
            </button>
          {/if}
        </a>
      </div>

      {#if pool.poolLink}
      <div class="ext-center px-1pc w-10pc">
        <a href={`${pool.poolLink}`} target="_blank">
          <button class="table-btn min-w-70px">
            Add to Pool
          </button>
        </a>
      </div>
      {/if}
      </div>
  {/each}
    </div>

</div>
