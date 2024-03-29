<script>
  import {subgraphRequest} from '../helpers/subgraph.js'
  import { _ } from 'svelte-i18n';
  import find from 'lodash/find';
  import get from 'lodash/get';
  import orderBy from 'lodash/orderBy';
  import { onMount } from "svelte";
  import { currentRoute } from "../stores/routes.js";
  import Etherscan from "../components/Etherscan.svelte";
  import Farming from "../components/Farming.svelte";
  import MixBytes from "../components/MixBytes.svelte";
  import CoinGeckoBanner from "../components/CoinGeckoBanner.svelte";
  import TooltipButton from '../components/elements/TooltipButton.svelte';
  import LiquidityModal from "../components/modals/ExperiPieLiquidityModal.svelte";
  import stakingPools from '../config/stakingPools.json';
  import AddMetamaskBanner from "../components/AddMetamaskBanner.svelte";
  import Modal from '../components/elements/Modal.svelte';
  import images from '../config/images.json';
  import poolsConfig from '../config/pools.json';
  import ovens from '../config/ovensConf.js';
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { amountFormatter, getTokenImage, formatFiat, subscribeToBalance } from '../components/helpers.js';

  import {
    eth,
  } from "../stores/eth.js";

  import PriceChartArea from '../components/charts/piePriceAreaChart.svelte'
  import Change from '../components/Change.svelte'
  import StrategyInUse from '../components/StrategyInUse.svelte'
  import ModalBig from '../components/elements/ModalBig.svelte';
  import PieExplanation from '../components/marketing-elements/pie-explanation-switch.svelte';
  import Experipie, { getNormalizedNumber } from '../classes/Experipie.js';
  import cToken from '../classes/CToken.js';
  import sushiData from '@sushiswap/sushi-data';

  export let params;

  let modal;
  let modalinfo;
  let modalOption = {
    method: "single",
    poolAction: "add",
    title: "Add Liquidity"
  }

  $: token = params.address;

  const isBakingPie = (address) => {
    return ovens.find((oven) => {
      if (oven.baking.address == address) {
        return oven;
      }
    });
  };

  const farmingPie = (address) => {
    return stakingPools.find((stakingPool) => {
      return stakingPool.containing.find((token) => {
        if (token.address == address) {
          return stakingPool;
        }
      });
    });
  };

  let farmingPieObj = farmingPie(params.address);
  farmingPieObj = farmingPieObj;

  let pieOfPies = false;
  let initialized = false;
  let Pie;
  let dropdownOpen = false;

  const toggleDropdow = (event) => {
    dropdownOpen = !dropdownOpen;
  };

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
  $: buyUrl = (poolsConfig[token] || {}).buyUrl;
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
  $: composition = (poolsConfig[token] || {}).composition;
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
      console.log('$eth.address', $eth.address);
      subscribeToBalance(token, $eth.address, true);
      initialize();
  }

  $: getSpread = ( () => {
    if(!nav || !tokenPrice || !Pie || !Pie.nav) {
      return {
        label: 'Spread',
        number: `n/a`
      };
    }
    
    console.log('Pie.nav', Pie.nav)
    let _nav = parseFloat(Pie.nav);

    let price = parseFloat(tokenPrice);
    
    let spread = (price - _nav);
    let spreadPercentage = Math.abs( spread / price * 100 );
    return {
      label: price > _nav ? 'Premium' : 'Discount',
      number: `${spreadPercentage.toFixed(2)}%`
    };
  })()

  const initialize = async () => {
    let res = [];
    let globalAPR = 0;
    const compoundData = await fetchCompoundData();
    const aaveData = await fetchAaveData();
    
    Pie = new Experipie(token, $eth.provider);
    await Pie.initialize($piesMarketDataStore);

    for (const el of Pie.composition) {
      let address = el.address.toLowerCase()
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
        console.log('tokenInfo', tokenInfo)
        let lendingInfo = await getLendingInfo(Pie.map, address, compoundData, aaveData);
        console.log(lendingInfo.apy, el.percentage, lendingInfo.apy * el.percentage)
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

    console.log('globalAPR', globalAPR)

    console.log('Pie.nav', Pie.nav)
    nav = formatFiat(Pie.nav.toFixed(2));
    marketCap = formatFiat(Pie.marketCap.toFixed(2));
    PieAPR = `${(globalAPR / 100).toFixed(2)}%`;
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
    
    console.log('---> ', protocolNamePie)
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
      
      case 'SushiBar':
        lendingInfo.apy = await doXSusi(map[address].underlying.price);
        break;
      
      case 'yGOV':
        lendingInfo.apy = 0.36;
        break;
    
      default:
        lendingInfo.apy = 0;
        break;
    }

    return lendingInfo;
  }


  async function doXSusi(price) {
    let sushiDailyVolume = 0;
    let sushiWeeklyVolume = 0;
    let stakedSushiValue = 0;
    let dailySushiApy = 0;
    let weeklySushyApy = 0;
    let xSushiSuply = 0;
    let xSushiRatio = 0;

    let sushiPrice = price;

    console.log('price', price)

    let r = await sushiData.exchange.dayData(8)
    
    for (var i = 0; i < 7; i++) {
        sushiWeeklyVolume += r[i + 1].volumeUSD;
    }

    r = await sushiData.exchange.dayData(2)
    sushiDailyVolume = r[1].volumeUSD;


    let info = await sushiData.bar.info();

    xSushiSuply = info.totalSupply;
    xSushiRatio = info.ratio;
    stakedSushiValue = xSushiSuply * xSushiRatio * sushiPrice;

    let dailyFees = sushiDailyVolume * 0.05 * 0.01;
    let weeklyFees = sushiWeeklyVolume * 0.05 * 0.01;
    let dailySushiApyRate = dailyFees / stakedSushiValue;
    dailySushiApy = Math.pow(1 + dailySushiApyRate, 365) - 1;
    dailySushiApy = dailySushiApy * 100;
    dailySushiApy = dailySushiApy.toFixed(2);
    let weeklySushiApyRate = weeklyFees / stakedSushiValue;
    weeklySushyApy = Math.pow(1 + weeklySushiApyRate, 52) - 1;
    weeklySushyApy = weeklySushyApy * 100;
    weeklySushyApy = weeklySushyApy.toFixed(2);

    let APR = ((dailyFees / xSushiSuply) * 365) / (xSushiRatio * sushiPrice)
    let APY = ( 1 + (APR / 365))^365 - 1

    console.log('SUSHI', {
      weeklySushyApy,
      dailySushiApy,
      APR,
      APY
    })
    //APY = (1 + Periodic Rate)Number of periods – 1
    
    
    return dailySushiApy;
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

  const buyToken = () => buyUrl ? window.open(buyUrl, '_blank') : location.href = "#/swap";

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

<Modal title="NAV vs Price" backgroundColor="#f3f3f3" bind:this="{modalinfo}">
  <span slot="content" class="p-4 font-thin">
    <strong>NAV</strong><br/>
    The net asset value (NAV) of a Pie represents the market value of each share’s portion of the Pie's underlying assets.<br/>
    The NAV is determined by adding up the value of all assets in the Pie and then dividing that value by the number of outstanding shares in the Pie.<br/><br/>

    <strong>Price</strong><br/>
    The Pie's market price is the price at which shares in the Pies can be bought or sold on the exchanges.<br/>
    The market price can fluctuate throughout the day as buyers and sellers interact with one another and trade.<br/>
    For this reason, at times the price can differ from the NAV, making it more convenient to buy or mint according to market fluctuations.
  </span>
</Modal>

<div class="content flex flex-col spl">
  <div class="flex w-full items-center justify-between">
    <div class="flex flex-row content-between justify-between items-center flex-wrap w-full">
      <div class="flex flex-row items-center">
        <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        <div class="mx-3 flex flex-col">
          <h1 class="text-xl leading-none font-black">{symbol}</h1>
          <h2 class="text-md leading-none font-black mb-4px">{name}</h2>
          {#if tokenPrice}
            <div class="flex items-center mincontent"><div class="text-xl leading-none font-thin whitespace-nowrap mincontent">{formatFiat(tokenPrice)} </div><span class="text-base whitespace-nowrap font-black mincontent ml-2"><Change showLabel={true} value={change24H} /></span></div>
          {/if}
          
        </div>
      </div>

      <div class="flex items-center flex-row-reverse flex-grow justify-between md:justify-start mt-2 mb-1 md:mt-0 md:mb-0 mr-0 hidden md:flex">
        <div class="relative inline-block text-left block">
          <div>
            <button on:click={toggleDropdow}  type="button" class="flex items-center justify-center w-full focus:outline-none min-w-6px px-2" id="options-menu" aria-haspopup="true" aria-expanded="true">
              <img width="5px" src={images.more} alt="More options" />
            </button>
          </div>
          {#if dropdownOpen}
            <div class="z-50 origin-top-right absolute right-0 mt-2 w-56 shadow-lg">
              <div class=" bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <div class="py-1">
                  <!-- svelte-ignore a11y-missing-attribute -->
                  <a on:click={() => {
                    modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
                    modalOption.poolAction = "add";
                    modalOption.title = "Add Liquidity";
                    modal.open()
                    toggleDropdow();
                  }} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Issue</a>
                  <!-- svelte-ignore a11y-missing-attribute -->
                  <a on:click={() => {
                    modalOption.method = "multi";
                    modalOption.poolAction = "withdraw";
                    modalOption.title = "Redeem";
                    modal.open()
                    toggleDropdow();
                  }} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Redeem</a>
                  {#if farmingPieObj}
                    <a href="#/staking/{farmingPieObj.slug}" class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Farm</a>
                  {/if}                    
                </div>
              </div>
            </div>
            {/if}
        </div>
        
        {#if isBakingPie(params.address)}
          <button class="flex min-w-45pc md:w-10pc md:min-w-210px items-center btnbig text-white text-left py-2 px-3 md:mr-2 hover:opacity-80" onclick="location.href='#/oven'">
            <!-- <div class="mr-10px"><img class="h-50px inline" src={images.exchangeemoji} alt={symbol} /></div> -->
            <div class="">
              <div class="text-base font-bold leading-5">Bake your Pie</div>
              <div class="text-sm font-thin block md:hidden">Save 97% gas</div>
              <div class="text-sm font-thin hidden md:block">Wait and save 97% gas</div>
            </div>
          </button>
        {/if}

        <button class="flex min-w-45pc md:w-10pc md:min-w-210px items-center btnbig text-white text-left py-2 px-3 mr-2 md:mr-2 hover:opacity-80" on:click={buyToken}>
          <!-- <div class="mr-10px"><img class="h-50px inline" src={images.exchangeemoji} alt={symbol} /></div> -->
          <div class="">
            <div class="text-base font-bold leading-5">Buy & Sell</div>
            <div class="text-sm font-thin">Instant swap</div>
          </div>
        </button>

      </div>
    </div>
  </div>
  
  <div class="flex w-full mt-2 md:mt-8 hidden md:flex">
    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black text-pink">
        {nav}
      </div>
      <a on:click={() => {
        modalinfo.open()
      }} class="cursor-pointer hover:opacity-60" role="menuitem">
      <div class="flex items-center font-bold text-xs md:text-base text-pink">
        NAV
            <img src={images.InfoIcon} class="ml-1" alt="info" width="16px" />
      </div>
    </div>

    <div class="p-0 flex-initial self-start mr-8">
      <div class="text-md md:text-md font-black text-black">
        {getSpread.number}
      </div>
      <TooltipButton tooltip="Difference between NAV and the Pie current price on exchanges">
      <div class="font-thin text-xs md:text-base text-black">{getSpread.label}</div>
      </TooltipButton>
    </div>

    <div class="p-0 flex-initial self-start mr-8">
      <div class="font-bold text-md md:text-md text-black">
        {PieAPR}
      </div>
      <div class="font-thin text-black text-xs md:text-base">Tot APY 🔥</div>
    </div>

    <div class="p-0 flex-initial self-start mr-6">
      <div class="text-md md:text-md font-black">
        {marketCap}
      </div>
      <div class="font-thin text-xs md:text-base">Market Cap</div>
    </div>
  </div>

  <div class="md:hidden w-100pc flex flex-col rounded-sm border-grey my-2 p-2">
    <div class="w-100pc flex justify-between items-center">
      <div class="font-bold text-left text-pink"><a on:click={() => { modalinfo.open() }} class="cursor-pointer flex" role="menuitem"><span>NAV </span><img src={images.InfoIcon} class="ml-1" alt="info" width="16px" /></div>
      <div class="font-bold text-right">{nav}</div>
    </div>
    <div class="w-100pc flex justify-between items-center">
      <div class="font-thin text-left">{getSpread.label}</div>
      <div class="font-bold text-right">{getSpread.number}</div>
    </div>
    <div class="w-100pc flex justify-between items-center">
      <div class="font-thin text-left">Tot APY 🔥</div>
      <div class="font-bold text-right">{PieAPR}</div>
    </div>
    <div class="w-100pc flex justify-between items-center">
      <div class="font-thin text-left">Market Cap</div>
      <div class="font-bold text-right">{marketCap}</div>
    </div>
  </div>

  {#if poolsConfig[token].coingeckoId}
    <PriceChartArea coingeckoId={poolsConfig[token].coingeckoId}/>
    <div class="w-100pc px-2 text-sm font-thin text-left">*Prices from CoinGecko</div>
  {/if}

  {#if initialized}
  <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>

  <div class="w-full block md:hidden lg:hidden flex flex-col bg-white rounded border-grey">
    {#each orderBy(composition,['percentage'], ['desc']) as pooledToken}
<div class="mx-4 thinborderbottom">
  <div class="flex items-center w-100pc py-4">
        <img width="50px" height="50px" class="mr-4" src={getTokenImage(pooledToken.address)} alt={pooledToken.symbol} />
      <div class="flex flex-col justify-around">
        <span class="text-lg leading-6">{pooledToken.symbol}</span>
        <div style={`width: ${15 * (pooledToken.percentage/100)}rem`} class="flex items-center bg-pink roundedxs min-w-50px">
          <span class="text-xs text-white px-1">{amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%</span>
        </div>
      </div>
      <div class="text-right flex flex-col justify-end items-end ml-auto">
        <span class="">{formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.current_price`, '-'))}</span>
        <Change value={get($piesMarketDataStore, `${pooledToken.address}.market_data.price_change_percentage_24h`, '-')} class="text-right" />
      </div>
  </div>
</div>
{/each}
</div>

  <div class="w-99pc m-4 hidden md:block lg:block">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2">Price</th>
          <!-- <th class="font-thin border-b-2 px-4 py-2">Balance</th> -->
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
            
            <!-- {#if !pieOfPies }
              <td class="border text-center px-4 py-2 font-thin">{formatFiat(pooledToken.balance ? pooledToken.balance.label : '0', ',', '.', '')}</td>
            {/if} -->

            <td class="border text-center px-4 py-2 font-thin">
              {#if pooledToken.productive}
                {pooledToken.productiveAs.metadata.apy}%
              {:else }
                None
              {/if}
            </td>

            <td class="flex items-center justify-center border text-center px-4 py-2">
              {#if pooledToken.productive}
                <StrategyInUse token={pooledToken} protocol={pooledToken.productiveAs.protocol.name} />
              {:else }
              <StrategyInUse protocol={'none'} />
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
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <Farming token={$currentRoute.params.address} />
    </div>  
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <MixBytes token={$currentRoute.params.address} />
    </div>
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <AddMetamaskBanner pie={poolsConfig[token]} pieAddress={token} />
    </div>
    {#if poolsConfig[token].coingeckoId}
      <div class="p-0 mt-2 flexgrow	min-w-230px">
        <CoinGeckoBanner pie={poolsConfig[token]} />
      </div>
    {/if}
  </div>
</div>

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

<!-- mobile stycky buttons-->
<div class="w-100pc flex items-center flex-row-reverse flex-grow justify-between mr-0 px-2pc pt-3 pb-3 md:hidden sticky-pie-buttons bg-gradient-white-transparent drowpdown-shadow-top">
  <div class="relative inline-block text-left block">
    <div>
      <button on:click={toggleDropdow}  type="button" class="flex items-center justify-center w-full focus:outline-none min-w-6px pl-1 pr-1" id="options-menu" aria-haspopup="true" aria-expanded="true">
        <img width="5px" src={images.more} alt="More options" />
      </button>
    </div>
    {#if dropdownOpen}
      <div class="z-50 origin-top-right sticky-dropdown mt-2 w-56 shadow-lg">
        <div class=" bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <div class="py-1">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={() => {
              modalOption.method =  poolsConfig[token].useRecipe ? "single" : "multi";
              modalOption.poolAction = "add";
              modalOption.title = "Add Liquidity";
              modal.open()
              toggleDropdow();
            }} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Issue</a>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={() => {
              modalOption.method = "multi";
              modalOption.poolAction = "withdraw";
              modalOption.title = "Redeem";
              modal.open()
              toggleDropdow();
            }} class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Redeem</a>
            {#if farmingPieObj}
              <a href="#/staking/{farmingPieObj.slug}" class="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900" role="menuitem">Farm</a>
            {/if}              
          </div>
        </div>
      </div>
      {/if}
  </div>
  
  {#if isBakingPie(params.address)}
    <button class="flex min-w-46pc items-center btnbig text-white text-left py-2 px-3" onclick="location.href='#/oven'">
      <!-- <div class="mr-10px"><img class="h-50px inline" src={images.exchangeemoji} alt={symbol} /></div> -->
      <div class="">
        <div class="text-base font-bold leading-5">Bake your Pie</div>
        <div class="text-sm font-thin block md:hidden">Save 97% gas</div>
        <div class="text-sm font-thin hidden md:block">Wait and save 97% gas</div>
      </div>
    </button>
  {/if}


  <button class="flex min-w-46pc items-center btnbig text-white text-left py-2 px-3 ml-1pc mr-1pc" on:click={buyToken}>
    <!-- <div class="mr-10px"><img class="h-50px inline" src={images.exchangeemoji} alt={symbol} /></div> -->
    <div class="">
      <div class="text-base font-bold leading-5">Buy & Sell</div>
      <div class="text-sm font-thin">Instant swap</div>
    </div>
  </button>

</div>

