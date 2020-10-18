<script>
  import {
    getTokenImage,
    formatFiat,
    calculateAPRBalancer,
    calculateAPRUniswap
  } from "../components/helpers.js";

  import { farming } from '../stores/eth/writables.js';


  $: tokensSwapOut = [
    {
      symbol: "DOUGH/ETH",
      address: "",
      addressTokenToStake: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
      addressUniPoll: '0x8314337d2b13e1A61EadF0FD1686b2134D43762F',
      balance: '0',
      weights: "80/20",
      aprEnabled: true,
      weeklyRewards: '110,000',
      poolLink: 'https://pools.balancer.exchange/#/pool/0xfae2809935233d4bfe8a56c2355c4a2e7d1fff1a/',
      type: 'Balancer',
      containing: [
        {
          symbol: "DOUGH",
          address: "0xad32A8e6220741182940c5aBF610bDE99E737b2D",
          balance: '0',
          icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+S/ETH",
      address: "",
      aprEnabled: true,
      balance: '0',
      weights: "70/30",
      addressTokenToStake: '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF',
      addressUniPoll: '0x220f25C2105a65425913FE0CF38e7699E3992B97',
      weeklyRewards: '20,000',
      poolLink: "https://pools.balancer.exchange/#/pool/0x35333cf3db8e334384ec6d2ea446da6e445701df/",
      type: 'Balancer',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+L/ETH",
      address: "",
      aprEnabled: true,
      balance: '0',
      weights: "70/30",
      contractType: 'Geyser',
      addressTokenToStake: '0xa795600590a7da0057469049ab8f1284baed977e',
      addressUniPoll: '0xb3c2b0056627cc1dc148d8fc29f5abdf4dd837bc',
      weeklyRewards: '20,000',
      poolLink: "https://pools.balancer.exchange/#/pool/0xa795600590a7da0057469049ab8f1284baed977e/",
      type: 'Balancer',
      containing: [
        {
          symbol: "DEFI+L",
          address: "0x78f225869c08d478c34e5f645d07a87d3fe8eb78",
          balance: '0',
          icon: getTokenImage('0x78f225869c08d478c34e5f645d07a87d3fe8eb78')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+S/DAI",
      address: "",
      aprEnabled: true,
      deprecated: true,
      addressTokenToStake: '0x7aeFaF3ea1b465dd01561B0548c9FD969e3F76BA',
      addressUniPoll: '0x64964cb69f40A1B56AF76e32Eb5BF2e2E52a747c',
      weights: "50/50",
      type: 'UniswapV2',
      poolLink: 'https://app.uniswap.org/#/add/0x6B175474E89094C44Da98b954EedeAC495271d0F/0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C',
      weeklyRewards: 'deprecated',
      balance: '0',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "DAI",
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          balance: '0',
          icon: getTokenImage('0x6B175474E89094C44Da98b954EedeAC495271d0F')
        },
      ]
    },
  ];

  window.addEventListener('price-update', function (e) {
    console.log('price-update', e)
    tokensSwapOut.forEach( async pool => {
        if(pool.aprEnabled) {
          console.log('symbol', pool.symbol);
          try {
            if( pool.type === 'UniswapV2') {
              await calculateAPRUniswap(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
            } else {
              await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
            }
          } catch(e) {
            console.log('e', e);
          }
          
        }  
    });
  }, false);
</script>

<div class="content flex flex-col spl">

<div class="flex flex-col w-100pc breakdown-table pt-2px">

  <!-- <div class="flex w-100pc min-w-1140px justify-between items-center mb-4">
    <div class=" font-thin px-2 py-2 text-left md:w-20pc">Asset name</div>
    <div class=" font-thin px-4 py-2 text-center hidden md:block w-14pc">DEX</div>
    <div class=" font-thin px-4 py-2 text-center hidden md:block md:w-8pc">Weights</div>
    <div class=" font-thin px-4 py-2 text-center md:w-10pc">Weekly Rewards</div>
    <div class=" font-thin px-4 py-2 text-center w-14pc">APR (unstable)</div>
    <div class=" font-thin px-4 py-2 text-center md:w-16pc">Liquidity</div>
    <div class=" font-thin px-4 py-2 text-center w-18pc">Stake</div>
  </div> -->

  <div class="flex w-100pc min-w-1140px min-h-50px justify-center items-center py-3 negativetop">

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

  {#each tokensSwapOut as pool}
  
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

<!-- <table class="breakdown-table table-auto w-full">
    <thead>
    <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left hidden md:block">Asset name</th>
        <th class="font-thin border-b-2 px-4 py-2">DEX</th>
        <th class="font-thin border-b-2 px-4 py-2">Weights</th>
        <th class="font-thin border-b-2 px-4 py-2">Weekly Rewards</th>
        <th class="font-thin border-b-2 px-4 py-2">APR (unstable)</th>
        <th class="font-thin border-b-2 px-4 py-2">Liquidity</th>
    </tr>
    </thead>
    <tbody>
    {#each tokensSwapOut as pool}
        <tr>
        <td class="border border-gray-800 px-2 py-2 text-left hidden md:block">
            {#each pool.containing as coins}
            <img
                class="inline icon ml-2 mr-2"
                src={coins.icon}
                alt={pool.symbol} />
                ({coins.symbol})
            {/each}
        </td>
        <td class="border text-center px-4 py-2">
            {#if pool.type === 'UniswapV2'}
            🦄 Uniswap V2
            {/if}
            {#if pool.type === 'Balancer'}
            ⚖️ Balancer
            {/if}
        </td>
        <td class="border text-center px-4 py-2">
            {pool.weights}
        </td>
        <td class="border text-center px-4 py-2">
            {pool.weeklyRewards}
        </td>
        
        <td class="border text-center py-2">
          {#if $farming[pool.addressUniPoll] && $farming[pool.addressUniPoll].apr}
            {$farming[pool.addressUniPoll].apr}
          {:else}
            {#if pool.contractType === 'Geyser'}
              See stake page
            {:else}
              n/a
            {/if}
          {/if}
        </td>

        <td class="border text-center py-2">
          {#if $farming[pool.addressUniPoll]}
            {formatFiat($farming[pool.addressUniPoll].totalLiquidity.toFixed(2))}
          {:else}
            n/a
          {/if}
        </td>
        
        <td class="border text-center py-2">
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
        </td>
        {#if pool.poolLink}
        <td class="border text-center py-2">
          <a href={`${pool.poolLink}`} target="_blank">
            <button class="table-btn min-w-70px">
              Add to Pool
            </button>
          </a>
        </td>
        {/if}
        </tr>
    {/each}
    </tbody>
</table> -->

        



