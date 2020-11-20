<script>
  import {getSubgraphMetadata, getPoolSwaps, getPoolMetrics} from '../helpers/subgraph.js'
  import { pieSmartPool } from '@pie-dao/abis';
  import { _ } from 'svelte-i18n';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';
  import get from 'lodash/get';
  import first from 'lodash/first';
  import flattenDeep from 'lodash/flattenDeep';
  import orderBy from 'lodash/orderBy';
  import { onMount } from "svelte";
  import { currentRoute } from "../stores/routes.js";
  import TradingViewWidget from "../components/TradingViewWidget.svelte";
  import Etherscan from "../components/Etherscan.svelte";
  import Farming from "../components/Farming.svelte";
  import Quantstamp from "../components/Quantstamp.svelte";
  import PoolDescription from "../components/PoolDescription.svelte";
  import images from '../config/images.json';
  import poolsConfig from '../config/pools.json';
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { fetchPooledTokens, pooledTokenAmountRequired, fetchCalcTokensForAmounts } from '../components/helpers.js';
  import { amountFormatter, getTokenImage, formatFiat, fetchPieTokens } from '../components/helpers.js';
  import {
    pools,
    balanceKey,
    contract,
    balances,
  } from "../stores/eth.js";

  import {
    buildFormulaNative
  } from '../helpers/tradingView.js'

  import PriceChartArea from '../components/charts/piePriceAreaChart.svelte'
  import Change from '../components/Change.svelte'
  export let params;

  $: token = params.address;

  $: console.log('token', token)

  let pieOfPies = false;
  let tradingViewWidgetComponent;
  let initialized = false;
  
  $: options = {
    symbol: poolsConfig[token] ? poolsConfig[token].tradingViewFormula : '',
    container_id: `single-pie-chart-${token}`,
    theme: 'light',
    autosize: true,
    interval: '60',
    locale: 'en',
    style: 3,
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false,
  };

  $: links = (poolsConfig[token] || {}).landingLinks || [];

  $: symbol = (poolsConfig[token] || {}).symbol;
  $: swapFees = (poolsConfig[token] || {}).swapFees;
  $: tokenLogo = images.logos[token];
  $: change24H = get(
    $piesMarketDataStore,
    `${token}.market_data.price_change_percentage_24h`,
    null,
  );
  $: tokenPrice = get(
    $piesMarketDataStore,
    `${token.toLowerCase()}.market_data.current_price`,
    null,
  );

  $: nav = 0;

  $: (() => {
    pieOfPies = false;
  })(token);

  $: composition = flattenDeep(
    $pools[token].map((component) => {
      if (component.isPie) {
        if(!pieOfPies) pieOfPies = [];
        pieOfPies.push(component);
        return $pools[component.address].map((internal) => {
          return {
            ...internal,
            percentage: (internal.percentage * component.percentage) / 100,
          };
        });
      }
      return component;
    })
  );

  $: pieTokens = fetchPieTokens($balances);

  $: metadata = {};

  $: (async () => {    
    if(initialized) return;

    const poolContract = await contract({ address: token });
    const bPoolAddress = await poolContract.getBPool();
    metadata = await getSubgraphMetadata(bPoolAddress.toLowerCase());
    nav = await calculateNavValue();
    
    initialized = true;
  })();

  const calculateNavValue = async () => {
    const tokenContract = await contract({ abi: pieSmartPool, address: token });
    let totalSupply = await tokenContract.totalSupply() / 1e18;
    return getLiquidity() / totalSupply;
  }

  const getLiquidity = () => {
    if(poolsConfig[token].swapEnabled)
      return metadata.liquidity;

    return $pools[token+"-usd"] ? $pools[token+"-usd"].toFixed(2) : 0
  }

  const renderWidget = async () => {
    const formula = await buildFormulaNative(token, bPoolAddress, $pools, $balances);
    if( formula === '') return;
    const finalFormula = `${formula.slice(0, -1)}`;
    options.symbol = finalFormula;
    if(tradingViewWidgetComponent) {
      initialized = true;
      tradingViewWidgetComponent.initWidget(options)
    }
}

</script>
<div class="content flex flex-col spl">
  <div class="flex flex-wrap w-full">
    <div class="flex flex-row content-between justify-between flex-wrap w-full">
      <div class="flex flex-row sm:w-full md:w-1/3">
        <a href={`#/pools/${token}`}>
          <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        </a>
        <div class="mx-3 flex flex-col justify-center">
          <a href={`#/pools/${token}`}>
            <h1 class="text-xl leading-none font-black">{symbol}</h1>
          </a>
          {#if tokenPrice}
            <h5 class="text-xl leading-none font-thin relative">{formatFiat(tokenPrice)} <span class="text-lg absolute font-black" style="top: 5px; right: -75px;"><Change value={change24H} /></span></h5>
          {/if}
          
        </div>
      </div>

      <div class="sm:w-full md:w-2/3 flex flex-row-reverse">
        <a href={`#/pools/${token}/withdraw/multi`}>
          <button class="btn text-white font-bold ml-0 mr-1 rounded md:ml-4 py-2 px-4">Redeem</button>
        </a>
        <a href={`#/pools/${token}`}>
          <button class="btn text-white font-bold ml-0 mr-1 rounded md:ml-4 py-2 px-4">Mint</button>
        </a>
        <!-- <a href={`https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0`}>
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Buy</button>
        </a> -->
      </div>
    </div>
  </div>
  
  <div class="flex w-full mt-2 md:mt-8">
    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black text-pink">
        {formatFiat($pools[token+"-nav"] ? $pools[token+"-nav"] : '')}
      </div>
      <div class="font-thin text-xs md:text-base text-pink">NAV</div>
    </div>

    <div class="p-0 flex-initial self-start mr-6">
      <div class="text-md md:text-md font-black">
        {#if poolsConfig[token].swapEnabled}
          {formatFiat(metadata.liquidity)}
        {:else}
          {formatFiat($pools[token+"-usd"] ? $pools[token+"-usd"].toFixed(2) : '')}
        {/if}
      </div>
      <div class="font-thin text-xs md:text-base">Liquidity</div>
    </div>

    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black">
        {#if metadata.createTime}
          {moment(moment.unix(metadata.createTime)).format('MMMM Do YYYY')}
        {:else}
          n/a
        {/if}
      </div>
      <div class="font-thin text-xs md:text-base">Inception date</div>
    </div>

    

    {#if poolsConfig[token].swapEnabled}
    <!-- <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black">
        {formatFiat(metadata.totalSwapVolume)}
      </div>
      <div class="font-thin text-xs md:text-base">Total Swap Volume</div>
    </div> -->

    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black">
        {formatFiat(metadata.totalSwapFee)}
      </div>
      <div class="font-thin text-xs md:text-base">Fees to LPs</div>
    </div>

    <!-- <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black">
        {formatFiat(metadata.lastSwapVolume)}
      </div>
      <div class="font-thin text-xs md:text-base">24h Pool Volume</div>
    </div> -->
    {/if}

  </div>

  {#if poolsConfig[token].coingeckoId}
    <PriceChartArea coingeckoId={poolsConfig[token].coingeckoId}/>
  {/if}

  <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>
  {#if pieOfPies }
    <h4>*This allocation is composed of multiple pies, find below the exploded allocation.</h4>
    <ul>
      {#each pieOfPies as subPie}
        <li><a href="#/pie/{subPie.address}">{subPie.symbol}</a></li>
      {/each}
    </ul>
  {/if}


  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2">Price</th>
          <th class="font-thin border-b-2 px-4 py-2">Allocation</th>
          {#if !pieOfPies }
              <!-- <th class="font-thin border-b-2 px-4 py-2">$ Adjusted</th> -->
              <th class="font-thin border-b-2 px-4 py-2">Balance</th>
          {/if}
          <!-- <th class="font-thin border-b-2 px-4 py-2">Market Cap</th> -->
          <th class="font-thin border-b-2 px-4 py-2">24H Change</th>
          <!-- <th class="font-thin border-b-2 px-4 py-2">Volume</th> -->
          <th class="font-thin border-b-2 px-4 py-2">Sparkline</th>
        </tr>
      </thead>
      <tbody>
        {#each orderBy(composition,['percentage'], ['desc']) as pooledToken}
          <tr>
            <td class="border border-gray-800 px-2 py-2 text-left">
              <img
                class="inline icon ml-2 mr-2"
                src={getTokenImage(pooledToken.address)}
                alt={pooledToken.symbol} />
              {pooledToken.symbol}
            </td>
            <td class="border px-4 ml-8 py-2 font-thin text-center">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.current_price`, '-'))}
            </td>
            <td class="border text-center px-4 py-2 font-thin">{amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%</td>

            {#if !pieOfPies }
              <!-- <td class="border text-center px-4 py-2">{amountFormatter({ amount: pooledToken.percentageUSD, displayDecimals: 2 })}%</td> -->
              <td class="border text-center px-4 py-2 font-thin">{formatFiat(pooledToken.balance ? pooledToken.balance : '0', ',', '.', '')}</td>
            {/if}
            
            <!-- <td class="border text-center px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.market_cap`, '-'))}
            </td> -->

            <td class="border text-center px-4 py-2">
              <Change value={get($piesMarketDataStore, `${pooledToken.address}.market_data.price_change_percentage_24h`, '-')} />
            </td>


            <!-- <td class="border text-center px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.total_volume`, '-'))}
            </td> -->

            <td class="border text-center py-2">
              <img
                class="w-30 spark greyoutImage mx-0"
                alt="Sparkline"
                src="https://www.coingecko.com/coins/{pooledToken.coingeckoImageId}/sparkline" 
                style="margin: auto;" />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <div class="flex flex-col w-full mt-2 md:mt-8 md:justify-between md:flex-row">
    <div class="p-0 mt-2 md:half">
      <Farming token={$currentRoute.params.address} />
    </div>  
    <div class="p-0 mt-2 md:w-1/4">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="p-0 mt-2 md:w-1/4">
      <Quantstamp class="w-1/2" token={$currentRoute.params.address} />
    </div>
  </div>
</div>
