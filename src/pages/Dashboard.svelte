<script>
	import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from "../config/pools.json";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { pools } from '../stores/eth.js';
  import ProductBox from '../components/elements/product-box.svelte';

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  import Change from '../components/Change.svelte'
  import Modal from '../components/elements/Modal.svelte';
  import LiquidityModal from "../components/modals/LiquidityModalSwitch.svelte";

  $: pies = filter(poolsConfig.selectable.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
    };
  }), {isExperipie: false}) || [];

  $: piVaults = filter(poolsConfig.selectable.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
    };
  }), {isExperipie: true}) || [];

  let modal;
  let modalOption = {
    method: "single",
    poolAction: "add",
    title: "Add Liquidity",
    token: null
  }

  $: getNav =((token) => {
    return formatFiat($pools[token+"-nav"] ? $pools[token+"-nav"] : '')
  })

  
</script>

<div class="content flex flex-col spl">

  <Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
    <span slot="content">
      <LiquidityModal 
        token={modalOption.token} 
        method={modalOption.method} 
        poolAction={modalOption.poolAction}
      />
    </span>
  </Modal>

  <!-- <img alt="ready to diversify?" src={images.amazingrewards} /> -->
  <div class="w-99pc m-4">

  <div class="my-10">
    <h1 class="text-lg">🆕 Pie Vaults</h1>
    <p class="font-thin">Yield Bearing & Meta-Governance Enabled</p>
  </div>

  <div class="flex justify-around w-100pc content-center">
    {#each piVaults as pie}
      <ProductBox 
        link={`#/pie/${pie.address}`}
        image={pie.icon}
        title={pie.symbol}
        description="DeFi’s Blue Chips. Bigger is Better."
      />
    {/each}
  </div>

  <div class="my-10">
    <h1 class="text-lg">🥧 Explore Pies</h1>
    <p class="font-thin">An Entire Portfolio in a Single Token</p>
  </div>


  <div class="w-99pc">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Index</th>
          <th class="font-thin border-b-2 px-4 py-2">Assets</th>
          <th class="font-thin border-b-2 px-4 py-2">Market Cap</th>
          <th class="font-thin border-b-2 px-4 py-2">24H Change</th>
          <th class="font-thin border-b-2 px-4 py-2">Current Price</th>
          <th class="font-thin border-b-2 px-4 py-2">Buy</th>
        </tr>
      </thead>
      <tbody>
        {#each pies as pie}
          <tr class="row-highlight">
            <td class="pointer border border-gray-800 px-2 py-2 text-left min-w-140px" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              <a class="flex items-center px-2 py-2" href={`#/pie/${pie.address}`}>
                <img
                  class="inline icon ml-2 mr-2"
                  src={pie.icon}
                  alt={pie.symbol} />
                  <span class="md:block">{pie.symbol}</span>
              </a>
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center min-w-200px" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              <a class="" href={`#/pie/${pie.address}`}>
                {#each pie.composition as coin}
                  <img
                    class="close-icons inline icon"
                    src={getTokenImage(coin.address)}
                    alt={coin.symbol} />
                {/each}
              </a>
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              <a href={`#/pie/${pie.address}`}>
                {pie.totalLiquidity}
              </a>
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              <Change value={pie.change} />
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              {getNav(pie.address)}
            </td>
            <td class="border px-4 ml-8 py-2 font-thin text-center">
              {#if pie.useMintOverBuy}
                <button on:click={() => {
                  modalOption.token = pie.address;
                  modal.open();
                }} class="table-btn highlight-box min-w-70px">
                  {pie.symbol}
                </button>
              {:else}
                <a target="_blank" href={`https://balancer.exchange/#/swap/ether/${pie.address}`}>
                  <button class="table-btn highlight-box min-w-70px">
                    {pie.symbol}
                  </button>
                </a>
              {/if}
            </td>
            
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

    <!-- <div class="mt-20 mb-0">
      <h1 class="text-lg">👨‍🌾 Honest worker? Explore Pie Farming Opportunities</h1>
      <p class="font-thin">Add liquidity to earn fees and DOUGH incentives.</p>
      <p class="font-thin">ℹ️ APR does not account for gains or losses from holding liquidity tokens.</p>
    </div> -->

    
  </div>
  
</div>
<!-- <FarmerTable /> -->
