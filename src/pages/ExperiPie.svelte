<script>
  import {subgraphRequest} from '../helpers/subgraph.js'
  import { _ } from 'svelte-i18n';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';
  import find from 'lodash/find';
  import get from 'lodash/get';
  import orderBy from 'lodash/orderBy';
  import { onMount } from "svelte";
  import { currentRoute } from "../stores/routes.js";
  import TradingViewWidget from "../components/TradingViewWidget.svelte";
  import Etherscan from "../components/Etherscan.svelte";
  import Farming from "../components/Farming.svelte";
  import MixBytes from "../components/MixBytes.svelte";
  
  import LiquidityModal from "../components/modals/ExperiPieLiquidityModal.svelte";

  import SingleAssetModal from "../components/modals/SingleAssetModal.svelte"; 

  import SnapshotBanner from "../components/SnapshotBanner.svelte";
  import AddMetamaskBanner from "../components/AddMetamaskBanner.svelte";
  import PoolDescription from "../components/PoolDescription.svelte";
  import images from '../config/images.json';
  import poolsConfig from '../config/pools.json';
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { amountFormatter, getTokenImage, formatFiat, subscribeToBalance } from '../components/helpers.js';
  import Accordion, { AccordionItem } from "svelte-accessible-accordion";

  import {
    eth,
  } from "../stores/eth.js";

  import PriceChartArea from '../components/charts/piePriceAreaChart.svelte'
  import Change from '../components/Change.svelte'
  import Apy from '../components/Apy.svelte'
  import StrategyInUse from '../components/StrategyInUse.svelte'
  import ModalBig from '../components/elements/ModalBig.svelte';
  import PieExplanation from '../components/marketing-elements/pie-explanation-switch.svelte';
  import Snapshot from '../components/Snapshot.svelte';
  import Experipie, { getNormalizedNumber } from '../classes/Experipie.js';
  import cToken from '../classes/CToken.js';

  export let params;

  let modal;
  let modalOption = {
    method: "single",
    poolAction: "add",
    title: "Add Liquidity"
  }

  $: token = params.address;

  let pieOfPies = false;
  let initialized = false;
  let Pie;
  
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

  $: symbol = (poolsConfig[token] || {}).symbol;
  $: name = (poolsConfig[token] || {}).name;
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

  $: nav = "n/a";
  $: PieAPR = "n/a";
  $: marketCap = "n/a";
  $: composition = (poolsConfig[token] || []).composition;
  $: metadata = {};

  $: lendingData = {
    compound: {},
    aave: {}
  };

  $: loadings = {
    init: false,
    compound: false,
    defiSDK: false,
  };

  $: if($eth.provider && $eth.address && !loadings.init && !initialized) {
      loadings.init = true;
      console.log('$eth.address', $eth.address)
      subscribeToBalance(token, $eth.address, true);
      initialize();
  }

  const initialize = async () => {
    let res = [];
    let globalAPR = 0;
    const compoundData = await fetchCompoundData();
    const aaveData = await fetchAaveData();
    
    Pie = new Experipie(token, $eth.provider);
    await Pie.initialize($piesMarketDataStore);

    for (const el of Pie.composition) {
      let address = el.address.toLowerCase()
      const data = Pie.map[address];
      let tokenInfo = find(poolsConfig[token].composition, (o) => address === o.address.toLowerCase());

      if(tokenInfo) {
        res.push({
          ...tokenInfo,
          balance: el.balance,
          price: el.price,
          productive: false,
          percentage: el.percentage
        })
      } else {
        let tokenInfo = find(poolsConfig[token].composition, (o) => Pie.map[address].underlying.address === o.address.toLowerCase());
        let lendingInfo = await getLendingInfo(Pie.map, address, compoundData, aaveData);
        globalAPR += lendingInfo.apy * el.percentage;

        res.push({
          ...tokenInfo,
          balance: el.balance,
          price: el.price,
          productive: true,
          percentage: el.percentage,
          productiveAs: {
            ...Pie.map[address],
            metadata: lendingInfo
          }
        })
      }
    }

    nav = formatFiat(Pie.nav.toFixed(2), 'n/a');
    marketCap = formatFiat(Pie.marketCap.toFixed(2), 'n/a');
    PieAPR = `${(globalAPR / 1000).toFixed(2)}%`;
    composition = res;

    console.log('res', res);
    initialized = true;
    loadings.init = false;
    return initialized;
  }

  const getLendingInfo = async(map, address, compoundData, aaveData) => {
    let lendingInfo = {};
    const protocolNamePie = map[address].protocol.name;
    const underlyingAddress = map[address].underlying.address

    switch (protocolNamePie) {
      case 'Aave':
        lendingInfo = find(aaveData, (o) => underlyingAddress === o.underlyingAsset.toLowerCase());
        lendingInfo.apy = (parseFloat(getNormalizedNumber(lendingInfo.liquidityRate, 27).toString()) * 100).toFixed(2);
        break;
      
      case 'Compound':
        lendingInfo = find(compoundData, (o) => {
          if(!o.underlying_address) return false;
          return underlyingAddress === o.underlying_address.toLowerCase();
        });
        lendingInfo.apy = (parseFloat(lendingInfo.supply_rate.value) * 100).toFixed(2);
        break;

      case 'C.R.E.A.M.':
        let creamToken = new cToken(address, $eth.provider);
        await creamToken.initialize()
        lendingInfo.apy = creamToken.apr;
        break;
    
      default:
        lendingInfo.apy = 0;
        break;
    }

    return lendingInfo;
  }

  onMount( async () => {
    initialize();
  });

  const fetchAaveData = async () => {
    const response = await subgraphRequest('https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw', {
      "reserves": {
        symbol: true,
        name: true,
        underlyingAsset: true,
        liquidityRate: true,
      }
    })

    lendingData.aave = response.reserves;
    loadings.aave = true;
    return response.reserves;
  }

  const fetchCompoundData = async () => {
    const response = await fetch('https://api.compound.finance/api/v2/ctoken');
    const result = await response.json();
    lendingData.compound = result.cToken;
    loadings.compound = true;
    return result.cToken
  }

</script>
<!-- <SnapshotBanner /> -->

<ModalBig title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
  <span slot="content">
    <LiquidityModal 
      pie={Pie}
      composition={composition}
      method={modalOption.method} 
      poolAction={modalOption.poolAction}
    />
    <!-- <SingleAssetModal /> -->
  </span>
</ModalBig>


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
            <h2 class="text-md leading-none font-black">{name}</h2>
          </a>
          {#if tokenPrice}
            <h5 class="text-xl leading-none font-thin relative">{formatFiat(tokenPrice)} <span class="text-lg absolute font-black" style="top: 5px; right: -100px;"><Change value={change24H} /></span></h5>
          {/if}
          
        </div>
      </div>

      <div class="w-100pc sm:w-full md:w-2/3 flex flex-row-reverse">
        <button disabled={!initialized} on:click={() => {
          modalOption.method = "multi";
          modalOption.poolAction = "withdraw";
          modalOption.title = "Redeem";
          modal.open()
        }} class="w-1/2 btn text-white font-bold ml-0 mr-1 rounded md:w-1/4 md:ml-4 py-2 px-4">Redeem</button>

        <button disabled={!initialized} on:click={() => {
          modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
          modalOption.poolAction = "add";
          modalOption.title = "Add Liquidity";
          modal.open()
        }} class="w-1/2 btn text-white font-bold ml-0 mr-1 rounded md:w-1/4 md:ml-4 py-2 px-4">Issue</button>
        
      </div>
    </div>
  </div>
  
  <div class="flex w-full mt-2 md:mt-8">
    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black text-pink">
        {nav}
      </div>
      <div class="font-bold text-xs md:text-base text-pink">NAV</div>
    </div>

    <div class="p-0 flex-initial self-start mr-8">
      <div class="font-bold text-md md:text-md text-pink">
        {PieAPR}
      </div>
      <div class="font-bold text-pink text-xs md:text-base">Tot APY</div>
    </div>

    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black">
        Meta-Governance
      </div>
      <div class="font-thin text-xs md:text-base">Enabled</div>
    </div>

    <div class="p-0 flex-initial self-start mr-6">
      <div class="text-md md:text-md font-black">
        {marketCap}
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

  {#if initialized}
  <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>

  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2">Price</th>
          <th class="font-thin border-b-2 px-4 py-2">Balance</th>
          <th class="font-thin border-b-2 px-4 py-2">APY</th>
          <th class="font-thin border-b-2 px-4 py-2">Strategy</th>
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

            <td class="border px-4 ml-8 py-2 font-thin text-center">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.current_price`, '-'))}
            </td>
            
            {#if !pieOfPies }
              <td class="border text-center px-4 py-2 font-thin">{formatFiat(pooledToken.balance ? pooledToken.balance.label : '0', ',', '.', '')}</td>
            {/if}

            <td class="border text-center px-4 py-2 font-thin">
              {#if pooledToken.productive}
                {pooledToken.productiveAs.metadata.apy}%
              {:else }
                None
              {/if}
            </td>

            <td class="flex items-center justify-center border text-center px-4 py-2">
              {#if pooledToken.productive}
                <StrategyInUse protocol={pooledToken.productiveAs.protocol.name} />
              {:else }
                None
              {/if}
            </td>

          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {:else}
    <div class="h-12px mx-50pc my-16px">
          <div class="loadingio-spinner-wedges-meab1ddaeuq"><div class="ldio-qudhur211ps">
          <div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>
          </div></div>
    </div>
    Loading
  {/if}

  <!-- <h1 class="mt-8 mb-4 text-base md:text-3xl">Open Proposals</h1> -->

  <!-- <Snapshot /> -->
  
  <div class="flex flex-col w-full mt-2 md:mt-8 md:justify-between md:flex-row">
    <div class="p-0 mt-2 md:w-1/4">
      <Farming token={$currentRoute.params.address} />
    </div>  
    <div class="p-0 mt-2 md:w-1/4">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="p-0 mt-2 md:w-1/4">
      <MixBytes token={$currentRoute.params.address} />
    </div>
    <div class="p-0 mt-2 md:w-1/4">
      <AddMetamaskBanner pie={poolsConfig[token]} pieAddress={token} />
    </div>
  </div>
</div>

<div class="container mt-4">
  <h1 class="text-xl leading-none font-black text-center mb-5">FAQ</h1>
</div>
<Accordion class="container px-5 py-0 spl flex flex-col">
  <AccordionItem class="border-none keyborder text-left w-100pc py-4" title="What is Meta-Governance?"><p class="font-thin text-sm">Content 1 </p></AccordionItem>
  <AccordionItem class="border-none keyborder text-left w-100pc py-4" title="How do we calculate tot APY?"><p class="font-thin text-sm">Content 1 </p></AccordionItem>
  <AccordionItem class="border-none keyborder text-left w-100pc py-4" title="How to exercise your voting rights?"><p class="font-thin text-sm">Content 1 </p></AccordionItem>
</Accordion>

<div class="content mt-4">
  <PieExplanation address={token} />
</div>

<div class="content spl">



  
{#if poolsConfig[token].swapEnabled}
<div class="container mt-4">
  <h1 class="text-xl leading-none font-black text-center mb-5">Key Facts</h1>

    <div class="flex flex-col justify-between mt-4  lg:flex-row">
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

    <div class="flex flex-col justify-between mt-4  lg:flex-row">
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

    <div class="flex flex-col justify-between mt-4  lg:flex-row">
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



