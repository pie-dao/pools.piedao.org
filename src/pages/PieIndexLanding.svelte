<script>
  import { _ } from "svelte-i18n";
  import get from "lodash/get";
  import first from "lodash/first";
  import flattenDeep from "lodash/flattenDeep";

  import { onMount } from "svelte";
  import { currentRoute } from "../stores/routes.js";
  import TradingViewWidget from "../components/TradingViewWidget.svelte";
  import Etherscan from "../components/Etherscan.svelte";
  import Farming from "../components/Farming.svelte";
  import Quantstamp from "../components/Quantstamp.svelte";

  import images from "../config/images.json";
  import poolsConfig from "../config/pools.json";
  import { CoinGecko, piesMarketDataStore } from "../stores/coingecko.js";

  import { fetchPooledTokens } from '../components/helpers.js';

  import { amountFormatter, getTokenImage, formatFiat } from "../components/helpers.js";

  import { pools } from '../stores/eth.js'

  export let params;

  $: token = params.address;
  
  let pieOfPies = false;
  let tradingViewWidgetComponent;

  $: symbol = (poolsConfig[token] || {}).symbol;
  $: swapFees = (poolsConfig[token] || {}).swapFees;
  $: tokenLogo = images.logos[token];
  $: change24H = get(
    $piesMarketDataStore,
    `${token}.market_data.price_change_percentage_24h`,
    null
  );
  $: tokenPrice = get(
    $piesMarketDataStore,
    `${token.toLowerCase()}.market_data.current_price.usd`,
    null
  );

  $: (() => {
    pieOfPies = false;
    
  })(token);

  $: console.log('pools', $pools);
  
  $: composition = flattenDeep(
    poolsConfig[token].composition.map((component) => {
      if (component.isPie) {
        if(!pieOfPies) pieOfPies = [];
        pieOfPies.push(component);
        return poolsConfig[component.address].composition.map((internal) => {
          return {
            ...internal,
            percentage: ((component.percentage / 100) * (internal.percentage / 100) * 100).toFixed(
              2
            ),
          };
        });
      }
      return component;
    })
  );

  $: options = {
    symbol: poolsConfig[token].tradingViewFormula,
    container_id: `single-pie-chart-${token}`,
    theme: "light",
    autosize: true,
    interval: "60",
    locale: "en",
    style: 3,
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false,
  };

  $: tradingViewWidgetComponent ? tradingViewWidgetComponent.initWidget(options) : null;

  onMount(async () => {
    CoinGecko.sync();
  });
</script>

<div class="content flex flex-col spl">

  <div class="flex flex-wrap w-full">
    <div class="flex flex-row content-between flex-wrap w-full">
      <div class="flex flex-row sm:w-full md:w-2/3">
        <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        <div class="mx-3">
          <h1 class="text-xl leading-none font-black">{symbol}</h1>
          {#if change24H}
            <h5
              class:green={change24H > 0}
              class:red={change24H < 0}
              class="text-sm leading-none font-thin">
              {change24H}%
            </h5>
          {/if}
          {#if tokenPrice}
            <h5 class="text-xl leading-none font-thin">{formatFiat(tokenPrice)}</h5>
          {/if}
        </div>
      </div>

      <div class="sm:w-full md:w-1/3">
        <a href={`#/pools/${token}`}>
          <button class="btn text-white font-bold py-2 px-4 rounded">Mint</button>
        </a>
        <a href={`https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0`}>
          <button class="btn clear font-bold py-2 px-4 rounded">Buy</button>
        </a>
        <!-- <a href={`#/pools/${token}`}></a>
          <button class="btn clear text-white font-bold py-2 px-4 rounded">Redeem</button>
        </a> -->
      </div>

    </div>
  </div>
  <div class="flex content-between flex-wrap w-full mt-8">
    <div class="w-1/4 p-0 self-start">
      <div class="text-center font-thin">MarketCap</div>
      <div class="text-center text-xl font-black">
        {formatFiat(get($piesMarketDataStore, `${token.toLowerCase()}.market_data.market_cap.usd`, '-'))}
      </div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">Swap fee</div>
      <div class="text-center text-xl font-black">{swapFees}%</div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">Streaming fee</div>
      <div class="text-center text-xl font-black">0%</div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">7 Days Change</div>
      <div class="text-center text-xl font-black">
        {get($piesMarketDataStore, `${token.toLowerCase()}.market_data.price_change_percentage_7d_in_currency.usd`, '-')}
      </div>
    </div>
  </div>

  <div
    class="flex flex-row w-100pc mt-8 spl-chart-container {poolsConfig[token].tradingViewFormula ? '' : 'hidden'}">
    <TradingViewWidget bind:this={tradingViewWidgetComponent} {options} />
  </div>

  <div class="flex content-between flex-wrap w-full mt-8">
    <div class="w-1/2 p-0">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="w-1/2 p-0">
      <Quantstamp class="w-1/2" token={$currentRoute.params.address} />
    </div>
  </div>

  <h1>Allocation breakdown</h1>
  {#if pieOfPies }
    <h4>*This allocation is composed of multiple pies, find below the exploded allocation.</h4>
    <ul>
      {#each pieOfPies as subPie}
        <li>
          <a href="#/pie/{subPie.address}">{subPie.symbol}</a>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="w-99pc m-4">
    <table class="table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2">Price</th>
          <th class="font-thin border-b-2 px-4 py-2">Current Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2">Market Cap</th>
          <th class="font-thin border-b-2 px-4 py-2">Volume</th>
          <th class="font-thin border-b-2 px-4 py-2">Change</th>
        </tr>
      </thead>
      <tbody>
        {#each composition as pooledToken}
          <tr>
            <td class="border-l-2 border-gray-200 border-b-2 px-2 py-2 text-center">
              <img
                class="inline icon"
                src={getTokenImage(pooledToken.address)}
                alt={pooledToken.symbol} />
              {pooledToken.symbol}
            </td>
            <td class="text-center border-b-2 px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address.toLowerCase()}.market_data.current_price.usd`, '-'))}
            </td>
            <td class="text-center border-b-2 px-4 py-2">{pooledToken.percentage}%</td>
            <td class="text-center border-b-2 px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address.toLowerCase()}.market_data.market_cap.usd`, '-'))}
            </td>
            <td class="text-center border-b-2 px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address.toLowerCase()}.market_data.total_volume.usd`, '-'))}
            </td>
            <td class="text-center border-b-2 border-r-2">
              <img
                class="w-30 spark"
                alt="Sparkline"
                src="https://www.coingecko.com/coins/{(first(get($piesMarketDataStore, `${pooledToken.address.toLowerCase()}.image.small`, '').match(/\d+\//g)) || '').slice(0, -1)}/sparkline" />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
