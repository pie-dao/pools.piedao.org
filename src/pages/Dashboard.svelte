<script>
  import BigNumber from 'bignumber.js';
  import orderBy from 'lodash/orderBy';
  import BalanceSmall from '../components/BalanceSmall.svelte';
  import FarmerTable from '../components/FarmerTable.svelte';
  import { currentRoute } from '../stores/routes.js';
  import poolsConfig from "../config/pools.json";
  import { CoinGecko, piesMarketDataStore } from '../stores/coingecko.js';
  import { pools } from '../stores/eth.js';
  import images from "../config/images.json";

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  $: pies = orderBy((poolsConfig.selectable.map(address => {
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0
    };
  }) || []), ['totalLiquidityNum'], ['desc']);

  const addToken = (pie) => {
    ethereum.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          "type":"ERC20",
          "options":{
            "address": pie.address,
            "symbol": pie.symbol,
            "decimals": 18,
            "image": pie.icon,
          },
        },
        id: Math.round(Math.random() * 100000),
    }, (err, added) => {
      if (added) {
        console.log('Thanks for your interest!')
      } else {
        alert('Something went wrong. Is Metamask there?')
      }
    })
  };
</script>

<div class="content flex flex-col spl">

  <img alt="ready to diversify?" src={images.amazingrewards} />
  <div class="w-99pc m-4">

    <div class="my-10">
      <h1 class="text-lg">🥧 Explore Pies</h1>
      <p class="font-thin">An Entire Portfolio in a Single Token</p>
    </div>

  <div class="flex flex-col w-100pc breakdown-table pt-2px">

    <div class="flex w-100pc min-w-1140px min-h-50px justify-center items-center py-3 mb-2 negativetop">
      <div class="font-thin text-left px-1pc items-stretch md:block w-15pc">
        Pie Name
      </div>
      <div class="font-thin text-center px-1pc block w-18pc md:block">
        Assets
      </div>
      <div class="font-thin text-center px-1pc w-18pc">
        Liquidity  
      </div>
      <div class="font-thin text-center px-1pc w-18pc">
        Get it
      </div>
      <div class="font-thin text-center px-1pc w-10pc">
        Mint tokens
      </div>
      <!-- <div class="font-thin text-center px-1pc w-10pc">
        Unwrap
      </div> -->
      <div class="font-thin ext-center px-1pc w-16pc">
      </div>
    </div>

    {#each pies as pie}
      <div class="flex w-100pc min-w-1140px min-h-50px justify-between items-center py-3 negativetop thinborder">
       
        <div class="text-center thinborderight items-stretch md:block w-15pc">
            <a class="flex items-center px-2" href={`#/pie/${pie.address}`}>
              <img
                class="inline icon ml-2 mr-2"
                src={pie.icon}
                alt={pie.symbol} />
                <span class="md:block">{pie.symbol}</span>
            </a>
        </div>
       
        <div class="text-center thinborderight block w-18pc w-18pc md:block">
          <a class="" href={`#/pie/${pie.address}`}>
          {#each pie.composition as coin}
            <img
              class="close-icons inline icon"
              src={getTokenImage(coin.address)}
              alt={coin.symbol} />
          {/each}
        </a>
        </div>
       
        <div class="text-center px-4 thinborderight w-18pc">
          <a href={`#/pie/${pie.address}`}>
            {pie.totalLiquidity}
          </a>
        </div>
        
        <div class="text-center px-4 thinborderight w-15pc">
          <a target={pie.useMintOverBuy ? '' : "_blank"} href={ pie.useMintOverBuy ? `#/pools/${pie.address}` : `https://balancer.exchange/#/swap/ether/${pie.address}`}>
            <button class="table-btn highlight-box min-w-70px">
              Get {pie.symbol}
            </button>
          </a>
        </div>
       
        <div class="text-center px-4 thinborderight w-10pc">
          <a href={`#/pools/${pie.address}`}>
            <button class="table-btn min-w-70px">
              Mint
            </button>
          </a>
        </div>
       
        <!-- <div class="text-center px-4 thinborderight w-10pc">
          <a href={`#/pools/${pie.address}/withdraw/multi`}>
            <button class="table-btn min-w-70px">
              Redeem
            </button>
          </a>
        </div> -->
       
        <div class="text-center px-4 w-16pc">
          <button on:click={() => addToken(pie)} class="table-btn min-w-70px">
            Add to MetaMask 🦊
          </button>
        </div>
     
      </div>
    {/each}
    </div>



    <div class="mt-20 mb-0">
      <h1 class="text-lg">👨‍🌾 Honest worker? Explore Pie Farming Opportunities</h1>
      <p class="font-thin">Add liquidity to earn fees and DOUGH incentives.</p>
      <p class="font-thin">ℹ️ APR does not account for gains or losses from holding liquidity tokens.</p>
    </div>

    
  </div>
  
</div>
<FarmerTable />
