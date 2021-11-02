<script>
	import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from "../config/pools.json";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { pools } from '../stores/eth.js';
  import ProductBox from '../components/elements/product-box.svelte';
  import Meta from '../components/elements/meta.svelte';

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  import Change from '../components/Change.svelte'
  import Modal from '../components/elements/Modal.svelte';
  import LiquidityModal from "../components/modals/LiquidityModalSwitch.svelte";

  $: pies = filter(poolsConfig.available.map(address => {
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

  $: piVaults = filter(poolsConfig.available.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    let price = get($piesMarketDataStore, `${address}.market_data.current_price`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
      price: price ? `$ ${price}` : `n/a`
    };
  }), {isExperipie: true}) || [];

  $: governingMining = filter(poolsConfig.available.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    let price = get($piesMarketDataStore, `${address}.market_data.current_price`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
      price: price ? `$ ${price}` : `n/a`
    };
  }), {isGoverningMining: true}) || [];  

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

<Meta 
  metadata={{
    title: "PieDAO Products Page, DEFI index and yield aggregators",
    description: "An overview of the PieDAO's products, including Pies and PieVaults DEFI index. BCP, DEFI++, DEFI+L, DEFI+S, BTC++, USD++, YPIE.",
  }}
/>

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

  <a class="h-100pc" target="_blank" href="/#/dough-staking-campaign">
    <img class="inline hidden md:block" src="https://github.com/pie-dao/brand/blob/master/misc/Homepage-Banner-Small.jpg?raw=true" alt="We are hiring banner" />
    <img class="inline block md:hidden" src="https://github.com/pie-dao/brand/blob/master/misc/Homepage-Banner-Small.jpg?raw=true" alt="We are hiring banner" />

  </a>

  <!-- <img alt="ready to diversify?" src={images.amazingrewards} /> -->
  <div class="w-99pc m-4">

  {#if piVaults.length }
    <div class="mt-0 mb-4 md:my-4 lg:my-6">
      <h1 class="text-lg">🆕 Pie Vaults</h1>
      <p class="font-thin">Yield Bearing & Meta-Governance Enabled</p>
    </div>

    <div class="flex flex-col justify-around w-100pc content-center lg:flex-row hidden md:flex lg:flex">
      <table class="breakdown-table table-auto w-full">
        <thead>
          <tr>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Index</th>
            <th class="font-thin border-b-2 px-4 py-2">Assets</th>
            <th class="font-thin border-b-2 px-4 py-2 text-left">24H Change</th>
            <th class="font-thin border-b-2 px-4 py-2">Current Price</th>
            <th class="font-thin border-b-2 px-4 py-2">Buy</th>
          </tr>
        </thead>
        <tbody>
          {#each piVaults as pie}
            <tr class="row-highlight">
              <td class="pointer border border-gray-800 px-2 py-2 text-left min-w-180px" on:click={() => window.location.hash = `#/${pie.symbol.toLowerCase()}`}>
                <a class="flex items-center px-2 py-2" href={`#/${pie.symbol.toLowerCase()}`}>
                  <img
                    class="inline icon ml-2 mr-2"
                    src={pie.icon}
                    alt={pie.symbol} />
                    <span class="md:block">{pie.symbol}</span>
                </a>
              </td>
              <td class="pointer border px-4 ml-8 py-2 font-thin text-center min-w-200px" on:click={() => window.location.hash = `#/${pie.symbol.toLowerCase()}`}>
                <a class="" href={`#/${pie.symbol.toLowerCase()}`}>
                  {#each pie.composition as coin}
                    <img
                      class="close-icons inline icon"
                      src={getTokenImage(coin.address)}
                      alt={coin.symbol} />
                  {/each}
                </a>
              </td>
              <td class="border text-center w-12pc px-4 py-2" on:click={() => window.location.hash = `#/${pie.symbol.toLowerCase()}`}>
                <Change value={pie.change} />
              </td>
              <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/${pie.symbol.toLowerCase()}`}>
                {pie.price}
              </td>
              <td class="border px-4 ml-8 py-2 font-thin text-center">
                {#if pie.buyButton}
                  {#if pie.useMintOverBuy}
                      <a href={`#/${pie.symbol.toLowerCase()}`}>
                        <button class="table-btn highlight-box min-w-70px">
                          {pie.symbol}
                        </button>
                      </a>
                  {:else}
                    <a href={`#/swap`}>
                      <button class="table-btn highlight-box min-w-70px">
                        {pie.symbol}
                      </button>
                    </a>
                  {/if}
                {/if}
              </td>
              
            </tr>
          {/each}
        </tbody>
      </table>
      <!-- {#each piVaults as pie}
        <ProductBox 
          class=""
          link={`#/pie/${pie.address}`}
          image={pie.icon}
          title={pie.symbol}
          description={pie.name}
        />
      {/each} -->
    </div>

    <div class="w-full block md:hidden lg:hidden flex flex-col bg-lightgrey rounded">
      {#each piVaults as pie}
      <a class="mx-4 thinborderbottom" href={`#/pie/${pie.address}`}>
        <div class="flex items-center w-100pc py-4">
              <img width="50px" height="50px" class="mr-4" src={pie.icon} alt={pie.symbol} />
            <div class="flex flex-col justify-around max-w-55pc">
              <span class="text-lg leading-6">{pie.symbol}</span>
              <span class="text-sm font-thin opacity-40" >{pie.description ? pie.description : "Another great porfolio"}</span>
              <!-- <span class="text-sm font-thin opacity-40" >{pie.totalLiquidity}</span> -->

            </div>
            <div class="text-right flex flex-col justify-end items-end ml-auto">
              <span class="">{pie.price}</span>
              <Change value={pie.change} class="text-right"/>
            </div>
        </div>
      </a>
      {/each}
    </div>

  {/if}

  <div class="mt-10 mb-4 md:mb-0 lg:mb-0">
    <h1 class="text-lg">🥧 Explore Pies</h1>
    <p class="font-thin">An Entire Portfolio in a Single Token</p>
  </div>


  <div class="w-full block md:hidden lg:hidden flex flex-col bg-lightgrey rounded">
    {#each pies as pie}
    <a class="mx-4 thinborderbottom" href={`#/pie/${pie.address}`}>
      <div class="flex items-center w-100pc py-4">
            <img width="50px" height="50px" class="mr-4" src={pie.icon} alt={pie.symbol} />
          <div class="flex flex-col justify-around">
            <span class="text-lg leading-6">{pie.symbol}</span>
            <span class="text-sm font-thin opacity-40" >{pie.totalLiquidity}</span>
          </div>
          <div class="text-right flex flex-col justify-end items-end ml-auto">
            <span class="">{getNav(pie.address)}</span>
            <Change value={pie.change} class="text-right"/>
          </div>
      </div>
    </a>
    {/each}
  </div>


  <div class="w-99pc hidden md:block lg:block mt-6">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Index</th>
          <th class="font-thin border-b-2 px-4 py-2">Assets</th>
          <!-- <th class="font-thin border-b-2 px-4 py-2">Market Cap</th> -->
          <th class="font-thin border-b-2 px-4 py-2 text-left">24H Change</th>
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
            <!-- <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              <a href={`#/pie/${pie.address}`}>
                {pie.totalLiquidity}
              </a>
            </td> -->
            <td class="border text-center w-12pc px-4 py-2" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
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
                <a href={`#/swap`}>
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

  {#if governingMining.length }
    <div class="mt-10 mb-4 md:mb-0 lg:mb-0">
      <h1 class="text-lg">💎 Governance Mining</h1>
      <p class="font-thin">Governance Mining Rewards</p>
    </div>

    <div class="flex flex-col justify-around w-99pc content-center lg:flex-row hidden md:flex lg:flex">
      <table class="breakdown-table table-auto w-full">
        <thead>
          <tr>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Index</th>
            <th class="font-thin border-b-2 px-4 py-2">Assets</th>
            <th class="font-thin border-b-2 px-4 py-2 text-left">24H Change</th>
            <th class="font-thin border-b-2 px-4 py-2">Current Price</th>
            <th class="font-thin border-b-2 px-4 py-2">Buy</th>
          </tr>
        </thead>
        <tbody>
          {#each governingMining as pie}
            <tr class="row-highlight">
              <td class="pointer border border-gray-800 px-2 py-2 text-left min-w-180px" on:click={() => window.location.hash = pie.symbol == "SLICE" ? '' : `#/pie/${pie.address}`}>
                <a class="flex items-center px-2 py-2" href={pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                  <img
                    class="inline icon ml-2 mr-2"
                    src={pie.icon}
                    alt={pie.symbol} />
                    <span class="md:block">{pie.symbol}</span>
                </a>
              </td>
              <td class="pointer border px-4 ml-8 py-2 font-thin text-center min-w-200px" on:click={() => window.location.hash = pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                <a class="" href={pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                  {#each pie.composition as coin}
                    <img
                      class="close-icons inline icon"
                      src={getTokenImage(coin.address)}
                      alt={coin.symbol} />
                  {/each}
                </a>
              </td>
              <td class="border text-center w-12pc px-4 py-2" on:click={() => window.location.hash = pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                <Change value={pie.change} />
              </td>
              <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                {pie.price}
              </td>
              <td class="border px-4 ml-8 py-2 font-thin text-center">
                {#if pie.buyButton}
                  {#if pie.useMintOverBuy}
                      <a href={pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
                        <button class="table-btn highlight-box min-w-70px">
                          {pie.symbol}
                        </button>
                      </a>
                  {:else}
                    <a href={`#/swap`}>
                      <button class="table-btn highlight-box min-w-70px">
                        {pie.symbol}
                      </button>
                    </a>
                  {/if}
                {/if}
              </td>
              
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="w-full block md:hidden lg:hidden flex flex-col bg-lightgrey rounded">
      {#each governingMining as pie}
      <a class="mx-4 thinborderbottom" href={pie.symbol == "SLICE" ? '#/slice' : `#/pie/${pie.address}`}>
        <div class="flex items-center w-100pc py-4">
              <img width="50px" height="50px" class="mr-4" src={pie.icon} alt={pie.symbol} />
            <div class="flex flex-col justify-around max-w-55pc">
              <span class="text-lg leading-6">{pie.symbol}</span>
              <span class="text-sm font-thin opacity-40" >{pie.description ? pie.description : "Another great porfolio"}</span>
              <!-- <span class="text-sm font-thin opacity-40" >{pie.totalLiquidity}</span> -->

            </div>
            <div class="text-right flex flex-col justify-end items-end ml-auto">
              <span class="">{pie.price}</span>
              <Change value={pie.change} class="text-right"/>
            </div>
        </div>
      </a>
      {/each}
    </div>
  {/if}
  </div>  
</div>

<!-- <FarmerTable /> -->
