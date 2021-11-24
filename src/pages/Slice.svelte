<script>
  import ModalBig from '../components/elements/ModalBig.svelte';
  import LiquidityModal from "../components/modals/ExperiPieLiquidityModal.svelte";
  import { _ } from 'svelte-i18n';
  import find from 'lodash/find';
  import get from 'lodash/get';
  import isEmpty from 'lodash/isEmpty';
  import orderBy from 'lodash/orderBy';
  import { onMount } from 'svelte';
  import Etherscan from '../components/Etherscan.svelte';
  import Farming from '../components/Farming.svelte';
  import MixBytes from '../components/MixBytes.svelte';
  import AddMetamaskBanner from '../components/AddMetamaskBanner.svelte';
  import images from '../config/images.json';
  import poolsConfig from '../config/pools.json';
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import {
    amountFormatter,
    getTokenImage,
    formatFiat,
    subscribeToBalance,
  } from '../components/helpers.js';
  import { eth } from '../stores/eth.js';
  import Change from '../components/Change.svelte';
  import PieExplanation from '../components/marketing-elements/pie-explanation-switch.svelte';
  import Experipie from '../classes/Experipie.js';

  let token = '0x1083d743a1e53805a95249fef7310d75029f7cd6';

  let initialized = false;
  let Pie;

  let modal;
  let modalOption = {
    method: "single",
    poolAction: "add",
    title: "Add Liquidity"
  }

  $: symbol = (poolsConfig[token] || {}).symbol;
  $: name = (poolsConfig[token] || {}).name;
  $: tokenLogo = images.logos[token];

  $: change24H = 0;
  $: nav = 0;

  $: composition = (poolsConfig[token] || {}).composition;

  $: loadings = {
    init: false,
    compound: false,
    defiSDK: false,
  };

  $: if(!isEmpty($piesMarketDataStore) && $eth.provider && $eth.address && !loadings.init && !initialized) {
    loadings.init = true;
    subscribeToBalance(token, $eth.address, true);
    initialize();
  }

  const initialize = async () => {
    let res = [];

    Pie = new Experipie(token, $eth.provider);
    await Pie.initialize($piesMarketDataStore);

    console.log("initialize", $piesMarketDataStore);
    console.log("PIE", Pie);
    
    for (const el of Pie.composition) {
      let address = el.address.toLowerCase();

      let tokenInfo = find(
        poolsConfig[token].composition,
        (o) => address === o.address.toLowerCase(),
      );

      res.push({
          ...tokenInfo,
          balance: el.balance,
          price: el.price,
          productive: false,
          percentage: el.percentage,
          address: address
        });
    }

    composition = res;
    nav = Pie.nav;

    let slice24Change = 0;

    composition.forEach(asset => {
      let change24 = get(
        $piesMarketDataStore,
        `${asset.address}.market_data.price_change_percentage_24h`,
        '-',
      );

      slice24Change += asset.percentage * change24;
    });

    change24H = slice24Change / 100;
    initialized = true;
    loadings.init = false;

    return initialized;
  };

  $: if(!isEmpty($piesMarketDataStore)) {
    initialize();
  }
</script>

<ModalBig title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
  <span slot="content">
    <LiquidityModal 
      pie={Pie}
      composition={composition}
      method={modalOption.method} 
      poolAction={modalOption.poolAction}
      modal={modal}
    />
    <!-- <SingleAssetModal /> -->
  </span>
</ModalBig>

<div class="content flex flex-col spl">
  <div class="flex w-full items-center justify-between">
    <div class="flex flex-row content-between justify-between items-center flex-wrap w-full">
      <div class="flex flex-row items-center">
        <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        <div class="mx-3 flex flex-col">
          <h1 class="text-xl leading-none font-black">{symbol}</h1>
          <h2 class="text-md leading-none font-black mb-4px">{name}</h2>
          {#if nav}
            <div class="flex items-center mincontent">
              <div class="text-l md:text-xl leading-none font-thin whitespace-nowrap mincontent">
                NAV {formatFiat(nav)}
              </div>
              <span class="text-base whitespace-nowrap font-black mincontent ml-2"
                ><Change showLabel={true} value={change24H} /></span
              >
            </div>
          {/if}
        </div>
      </div>

      <div
        class="flex items-center flex-row-reverse flex-grow justify-between md:justify-start mt-2 mb-1 md:mt-0 md:mb-0 mr-0 hidden md:flex"
      >
        <button
          class="flex min-w-45pc md:w-10pc md:min-w-210px items-center btnbig text-white text-left py-2 px-3 mr-2 md:mr-2 hover:opacity-80"
          on:click={() => {
            modalOption.method = "multi";
            modalOption.poolAction = "withdraw";
            modalOption.title = "Redeem";
            modal.open();
          }}
        >
          <div class="">
            <div class="text-base font-bold leading-5">Redeem SLICE</div>
            <div class="text-sm font-thin">Redeem underlying assets</div>
          </div>
        </button>

        <button
          class="flex min-w-45pc md:w-10pc md:min-w-210px items-center btnbig text-white text-left py-2 px-3 md:mr-2 hover:opacity-80"
          onclick="location.href='#/dough-staking'"
        >
          <div class="">
            <div class="text-base font-bold leading-5">Stake DOUGH</div>
            <div class="text-sm font-thin block md:hidden">Stake and earn SLICE</div>
            <div class="text-sm font-thin hidden md:block">Stake and earn SLICE</div>
          </div>
        </button>
      </div>
    </div>
  </div>

  {#if initialized}
    <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>
    <!-- allocation breakdown for mobile -->
    <div class="w-full block md:hidden lg:hidden flex flex-col bg-white rounded border-grey">
      {#each orderBy(composition, ['percentage'], ['desc']) as pooledToken}
        <div class="mx-4 thinborderbottom">
          <div class="flex items-center w-100pc py-4">
            <img
              width="50px"
              height="50px"
              class="mr-4"
              src={getTokenImage(pooledToken.address)}
              alt={pooledToken.symbol}
            />
            <div class="flex flex-col justify-around">
              <span class="text-lg leading-6">{pooledToken.symbol}</span>
              <div
                style={`width: ${10 * (pooledToken.percentage / 100)}rem`}
                class="flex items-center bg-pink roundedxs min-w-50px"
              >
                <span class="text-xs text-white px-1"
                  >{amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%</span
                >
              </div>
            </div>
            <div class="text-right flex flex-col justify-end items-end ml-auto">
              <span class=""
                >{formatFiat(
                  get(
                    $piesMarketDataStore,
                    `${pooledToken.address}.market_data.current_price`,
                    '-',
                  ),
                )}</span
              >
              <Change
                value={get(
                  $piesMarketDataStore,
                  `${pooledToken.address}.market_data.price_change_percentage_24h`,
                  '-',
                )}
                class="text-right"
              />
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- allocation breakdown for desktop -->
    <div class="w-99pc m-4 hidden md:block lg:block">
      <table class="breakdown-table table-auto w-full">
        <thead>
          <tr>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Allocation</th>
            <th class="font-thin border-b-2 px-4 py-2">Price</th>
            <th class="font-thin border-b-2 px-4 py-2">24H Change</th>
            <th class="font-thin border-b-2 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {#each orderBy(composition, ['percentage'], ['desc']) as pooledToken}
            <tr>
              <td class="border border-gray-800 px-2 py-2 text-left">
                <img
                  class="inline icon ml-2 mr-2"
                  src={getTokenImage(pooledToken.address)}
                  alt={pooledToken.symbol}
                />
                {pooledToken.symbol}
              </td>

              <td class="border text-center px-4 py-2 font-thin relative w-50">
                <div
                  style={`width: ${40 * (pooledToken.percentage / 100)}rem`}
                  class="percentage-bar float-left bg-pink h-6 roundedxs hidden md:block"
                >
                  {#if pooledToken.percentage >= 7}
                    <span
                      >{amountFormatter({
                        amount: pooledToken.percentage,
                        displayDecimals: 2,
                      })}%</span
                    >
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
                {formatFiat(
                  get(
                    $piesMarketDataStore,
                    `${pooledToken.address}.market_data.current_price`,
                    '-',
                  ),
                )}
              </td>

              <td class="border text-center px-4 py-2 font-thin">
                <Change
                  value={get(
                    $piesMarketDataStore,
                    `${pooledToken.address}.market_data.price_change_percentage_24h`,
                    '-',
                  )}
                />
              </td>

              <td class="border text-center px-4 py-2">
                {#if pooledToken.isPie}
                <a
                  href=''
                  on:click={() => {
                    initialized = false;
                    window.location.hash = `#/pie/${pooledToken.address}`;
                    window.location.reload();
                  }}
                >
                  <button class="table-btn highlight-box min-w-70px"> Visit </button>
                </a>
              {:else}
                <img
                  class="w-30 spark greyoutImage mx-0"
                  alt="Sparkline"
                  src="https://www.coingecko.com/coins/{pooledToken.coingeckoImageId}/sparkline"
                  style="margin: auto;"
                />
              {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="h-12px mx-50pc my-16px">
      <div class="loadingio-spinner-wedges-meab1ddaeuq">
        <div class="ldio-qudhur211ps">
          <div>
            <div><div /></div>
            <div><div /></div>
            <div><div /></div>
            <div><div /></div>
          </div>
        </div>
      </div>
    </div>
    Loading
  {/if}

  <div class="flex flex-col w-full mt-2 md:mt-8 md:justify-between md:flex-row">
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <Farming {token} />
    </div>
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <Etherscan {token} />
    </div>

    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <MixBytes {token} />
    </div>
    <div class="p-0 mt-2 md:w-1/4 md:mr-10px">
      <AddMetamaskBanner pie={poolsConfig[token]} pieAddress={token} />
    </div>
  </div>
</div>

<div class="content mt-4">
  <PieExplanation address={token} />
</div>

<!-- mobile stycky buttons-->
<div
  class="w-100pc flex items-center flex-row-reverse flex-grow justify-between mr-0 px-2pc pt-3 pb-3 md:hidden sticky-pie-buttons bg-gradient-white-transparent drowpdown-shadow-top"
>
  <button
    class="flex min-w-46pc items-center btnbig text-white text-left py-2 px-3 ml-1pc mr-1pc"
    on:click={() => {
      modalOption.method = "multi";
      modalOption.poolAction = "withdraw";
      modalOption.title = "Redeem";
      modal.open();
    }}
  >
    <div class="">
      <div class="text-base font-bold leading-5">Redeem SLICE</div>
      <div class="text-sm font-thin">underlying assets</div>
    </div>
  </button>

  <button
    class="flex min-w-46pc items-center btnbig text-white text-left py-2 px-3"
    onclick="location.href='#/dough-staking'"
  >
    <div class="">
      <div class="text-base font-bold leading-5">Stake DOUGH</div>
      <div class="text-sm font-thin">and earn SLICE</div>
    </div>
  </button>
</div>
