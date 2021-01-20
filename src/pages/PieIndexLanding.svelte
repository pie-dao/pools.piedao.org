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
  import LiquidityModal from "../components/modals/LiquidityModal.svelte";
  import AddMetamaskBanner from "../components/AddMetamaskBanner.svelte";
  import CoinGeckoBanner from "../components/CoinGeckoBanner.svelte";
  import KeyFacts from "../components/KeyFacts.svelte";
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
  import Modal from '../components/elements/Modal.svelte';
  import PieExplanation from '../components/marketing-elements/pie-explanation-switch.svelte';


  export let params;

  let modal;
  let modalOption = {
    method: "single",
    poolAction: "add",
    title: "Add Liquidity"
  }

  $: token = params.address;

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
  $: name = (poolsConfig[token] || {}).name;
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

  const getInternalWeights = (component, base) => {
        return $pools[component.address].map((internal) => {
          if (internal.isPie) {
            let newbase = (base * internal.percentage/ 100)
            return getInternalWeights(internal, newbase);
          }

          return {
            ...internal,
            percentage: (internal.percentage * base) / 100,
          };
        });
  };

  $: composition = flattenDeep(
    $pools[token].map((component) => {
      if (component.isPie) {
        if(!pieOfPies) pieOfPies = [];
        pieOfPies.push(component);
        return getInternalWeights(component, component.percentage);
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
    console.log('metadata', metadata);
    initialized = true;
  })();

  $: getLiquidity = (() => {
    if(poolsConfig[token].swapEnabled)
      return metadata.liquidity;

    return $pools[token+"-usd"] ? $pools[token+"-usd"].toFixed(2) : 0
  })()

  $: getNav =(() => {
    return formatFiat($pools[token+"-nav"] ? $pools[token+"-nav"] : '')
  })()

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
<Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
  <span slot="content">
    <LiquidityModal 
      token={token} 
      method={modalOption.method} 
      poolAction={modalOption.poolAction}
    />
  </span>
</Modal>
<div class="content flex flex-col spl">
  
  <div class="flex flex-wrap w-full">
    <div class="flex flex-row content-between justify-between items-center flex-wrap w-full">
      <div class="flex flex-row items-center sm:w-full md:w-40pc">
        <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        <div class="mx-3 flex flex-col">
          <h1 class="text-xl leading-none font-black">{symbol}</h1>
          <h2 class="text-md leading-none font-black mb-4px">{name}</h2>
          {#if tokenPrice}
            <div class="flex items-center mincontent"><div class="text-xl leading-none font-thin whitespace-nowrap mincontent">{formatFiat(tokenPrice)} </div><span class="text-base whitespace-nowrap font-black mincontent ml-2"><Change showLabel={true} value={change24H} /></span></div>
          {/if}
          
        </div>
      </div>

      <div class="w-100pc sm:w-full md:w-60pc flex justify-end">

        <button on:click={() => {
          modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
          modalOption.poolAction = "add";
          modalOption.title = "Add Liquidity";
          modal.open()
        }} class="flex w-1/2 btnbig text-white text-left ml-0 mr-1 py-2 px-2 md:ml-4">
        <div class="mr-10px"><img class="h-40px inline" src={images.exchangeemoji} alt={symbol} /></div>
        <div class="">
          <div class="text-lg font-bold">Buy & Sell</div>
          <div class="text-base font-thin">Instantly swap on Dexes</div>
        </div>
        </button>


        <button on:click={() => {
          modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
          modalOption.poolAction = "add";
          modalOption.title = "Add Liquidity";
          modal.open()
        }} class="flex w-1/2 btnbig text-white text-left ml-0 mr-1 py-2 px-2 md:ml-4">
        <div class="mr-10px"><img class="h-50px inline" src={images.waitoven} alt={symbol} /></div>
        <div class="">
          <div class="text-lg font-bold">Bake your Pie</div>
          <div class="text-base font-thin">Wait but save 97% gas</div>
        </div>
        </button>

        <!-- <button on:click={() => {
          modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
          modalOption.poolAction = "add";
          modalOption.title = "Add Liquidity";
          modal.open()
        }} class="w-1/2 btn text-white font-bold ml-0 mr-1 rounded md:w-1/4 md:ml-4 py-2 px-4">Issue</button>

        <button on:click={() => {
          modalOption.method = "multi";
          modalOption.poolAction = "withdraw";
          modalOption.title = "Redeem";
          modal.open()
        }} class="w-1/2 btn text-white font-bold ml-0 mr-1 rounded md:w-1/4 md:ml-4 py-2 px-4">Redeem</button> -->
        
        <!-- <a href={`https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0`}>
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Buy</button>
        </a> -->
      </div>
    </div>
  </div>
  
  <div class="flex w-full mt-2 md:mt-8">
    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black text-pink">
        {getNav}
      </div>
      <div class="font-bold text-xs md:text-base text-pink">NAV</div>
    </div>

    <div class="p-0 flex-initial self-start mr-6">
      <div class="text-md md:text-md font-black">
        {#if poolsConfig[token].swapEnabled}
          {formatFiat(metadata.liquidity)}
        {:else}
          {formatFiat($pools[token+"-usd"] ? $pools[token+"-usd"].toFixed(2) : '')}
        {/if}
      </div>
      <div class="font-thin text-xs md:text-base">Market Cap</div>
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

  </div>

  {#if poolsConfig[token].coingeckoId}
    <PriceChartArea coingeckoId={poolsConfig[token].coingeckoId}/>
  {/if}

  <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>

  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Price</th>
          
          {#if !pieOfPies }
              <!-- <th class="font-thin border-b-2 px-4 py-2">$ Adjusted</th> -->
              <th class="font-thin border-b-2 px-4 py-2 text-left">Balance</th>
          {/if}
          <th class="font-thin border-b-2 px-4 py-2 text-left">24H Change</th>
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

            <td class="border text-center px-4 py-2 font-thin relative w-50">
                <div style={`width: ${40 * (pooledToken.percentage/100)}rem`} class="percentage-bar float-left bg-pink h-6 roundedxs hidden md:block">
                  {#if pooledToken.percentage >= 7}
                  <span>{amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%</span>
                  {/if}
                </div>
                {#if pooledToken.percentage < 7}
                  <div class="float-left hidden md:block mt-1 ml-2 percentage-bar-extra-num">
                    {amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%
                  </div>
                {/if}

                <div class="block md:hidden">
                  {amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%
                </div>
            </td>

            <td class="border px-4 ml-8 py-2 font-thin text-left">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.current_price`, '-'))}
            </td>
            

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

            <td class="border text-center py-2 px-4 md:px-0">
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

  {#if pieOfPies }
    <div class="font-thin w-full px-4 py-2 text-left">
      <h4>*This allocation is composed of multiple pies, find below the exploded allocation.</h4>
      <ul>
        {#each pieOfPies as subPie}
          <li><a class="font-bold" href="#/pie/{subPie.address}">{subPie.symbol}</a></li>
        {/each}
      </ul>
    </div>
  {/if}
  
  <div class="flex flex-col w-full mt-2 md:mt-8 md:justify-between md:flex-row md:flex-wrap">
    <div class="p-0 mt-2 flexgrow min-w-230px">
      <Farming token={$currentRoute.params.address} />
    </div>  
    <div class="p-0 mt-2 flexgrow	min-w-230px">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="p-0 mt-2 flexgrow	min-w-230px">
      <Quantstamp token={$currentRoute.params.address} />
    </div>
    <div class="p-0 mt-2 flexgrow	min-w-230px">
      <AddMetamaskBanner pie={poolsConfig[token]} pieAddress={token} />
    </div>
    <div class="p-0 mt-2 flexgrow	min-w-230px">
      <CoinGeckoBanner pie={poolsConfig[token]} pieAddress={token} />
    </div>
  </div>
</div>

<div class="content mt-4">
  <PieExplanation address={token} />
</div>

<div class="content spl">

  
{#if poolsConfig[token].swapEnabled}
<div class="container mt-4 px-2 lg:px-0">
  <h1 class="text-xl leading-none font-black text-center mb-5">Key Facts</h1>

    <div class="flex flex-col justify-between lg:mt-4  lg:flex-row">
      <div class="left flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:mr-20px lg:flex-row">
        <div class="top flex justify-between">
            <div class="titolo">Fees to LPs</div>
            <div class="info font-thin mb-1">{formatFiat(metadata.totalSwapFee)}</div>
          </div>
          <div class="bottom font-thin text-sm mb-2">fees distributed to liquitity providers</div>
      </div>

      <div class="right flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:ml-20px lg:flex-row">
        <div class="top flex justify-between">
          <div class="titolo">Pool Swap Fee</div>
          <div class="info font-thin mb-1">{metadata.swapFee * 100}%</div>
        </div>
        <div class="bottom font-thin text-sm mb-2">swaps fee capture value during rebalancing</div>
      </div>
    </div>

    <div class="flex flex-col justify-between lg:mt-4  lg:flex-row">
      <div class="left flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:mr-20px lg:flex-row">
        <div class="top flex justify-between">
          <div class="titolo">Streaming Fees</div>
          <div class="info font-thin mb-1">{poolsConfig[token].streamingFees}%</div>
        </div>
        <div class="bottom font-thin text-sm mb-2">paid out to the DAO linearly over time based on the entire market cap of the index</div>
      </div>

      <div class="right flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:ml-20px lg:flex-row">
        <div class="top flex justify-between">
          <div class="titolo">Total Swap Volume</div>
          <div class="info font-thin mb-1">{formatFiat(metadata.totalSwapVolume)}</div>
        </div>
        <div class="bottom font-thin text-sm mb-2">total swap volume generated by the pool</div>
      </div>
    </div>

    <div class="flex flex-col justify-between lg:mt-4  lg:flex-row">
      <div class="left flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:mr-20px lg:flex-row">
        <div class="top flex justify-between">
          <div class="titolo">All Time Low</div>
          <div class="info font-thin mb-1">
            {#if get($piesMarketDataStore, `${token.toLowerCase()}.market_data.atl`,'n/a') != 'n/a' }
              {formatFiat(get($piesMarketDataStore, `${token.toLowerCase()}.market_data.atl`,'n/a'))}
            {:else}
              n/a
            {/if}
          </div>
        </div>
        <div class="bottom font-thin text-sm mb-2">all time low of the index</div>
      </div>

      <div class="right flex-col justify-between keyborder mt-2 mb-2 lg:w-1/2 lg:ml-20px lg:flex-row">
        <div class="top flex justify-between">
          <div class="titolo">Daily Pool Volume</div>
          <div class="info font-thin mb-1">{formatFiat(metadata.lastSwapVolume)}</div>
        </div>
        <div class="bottom font-thin text-sm mb-2">daily volume generated by the pool</div>
      </div>
    </div>    
  </div>
{/if}

</div>

