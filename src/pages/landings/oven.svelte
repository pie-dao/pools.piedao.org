<script>
  import images from "../../config/images.json";
  import ProductBox from '../../components/elements/product-box.svelte';
  import orderBy from 'lodash/orderBy';
  import poolsConfig from "../../config/pools.json";
  import { pools } from '../../stores/eth.js';


  import get from 'lodash/get';
  import {piesMarketDataStore} from '../../stores/coingecko.js';
  import {
    getTokenImage,
    formatFiat,
  } from "../../components/helpers.js";
  import Modal from '../../components/elements/Modal.svelte';

  import Change from '../../components/Change.svelte'
import OvenModal from "../../components/OvenModal.svelte";

  $: pies = orderBy((poolsConfig.selectable.map(address => {
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
  }) || []), ['change'], ['desc']);

  let modal;
  let modalOption = {
    title: "Bake"
  }

</script>

  <Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this="{modal}">
    <span slot="content">
      <OvenModal />
    </span>
  </Modal>
  <section class="pt-12 px-4 text-center">
    <div class="w-full max-w-2xl mx-auto">
      <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Bake a Pie together</h2>
      <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">Oven makes possible to collect ETH together and mint the PIE all in once. In this way mint happens only once the ETH limit is reached and all participants share the gas cost, making it significantly more convenient than minting a Pie on your own. Beware: The Oven must be full befor start baking!</p>
    </div>
  </section>

  <div class="content flex flex-col w-100pc justify-between spl text-center md:w-80pc">
    <div class="flex flex-col justify-around w-100pc content-center lg:flex-row">
      <ProductBox 
        link="#/pie/0x78f225869c08d478c34e5f645d07a87d3fe8eb78"
        image={images.depositeth}
        title="Deposit ETH together"
        description="Deposit the amount of ETH you want to use to issue the PIE you want"
      />
      
      <ProductBox 
        link="#/pie/0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c"
        image={images.waitoven}
        title="Wait the Oven limit"
        description="Oven must be full as baking starts when a specific limit is reached"
      />

      <ProductBox 
      link="#/pie/0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c"
      image={images.sharegascost}
      title="Share the gas cost"
      description="Once the limit is reached we will bake the PIE all together using gas once"
    />
    </div>
</div>

<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Select a Pie to bake</h2>
  </div>
</section>

<div class="flex flex-col w-96pc place-content-center spl">
  <table class="breakdown-table table-auto w-full mx-6">
    <thead>
      <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left">Pie Name</th>
        <th class="font-thin border-b-2 px-4 py-2">Total Baked</th>
        <th class="font-thin border-b-2 px-4 py-2">Next Bake</th>
        <th class="font-thin border-b-2 px-4 py-2">Gas Savings</th>
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
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
            <a href={`#/pie/${pie.address}`}>
              {pie.totalLiquidity}
            </a>
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
            <Change value={pie.change} />
          </td>
          <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
            {#if $piesMarketDataStore[pie.address] }
              {formatFiat(get($piesMarketDataStore, `${pie.address}.market_data.current_price`, '-'))}
            {:else}
              {formatFiat(pie.nav)}
            {/if}
          </td>
          <td class="border px-4 ml-8 py-2 font-thin text-center">
              <button on:click={modal.open} class="table-btn highlight-box min-w-70px">
                Bake
              </button>
          </td>
          
        </tr>
      {/each}
    </tbody>
  </table>
</div>




<section class="pt-12 px-4 text-center">
  <div class="w-full max-w-2xl mx-auto">
    <h2 class="text-xl mt-2 mb-6 leading-tight font-heading">Want your PIE faster?</h2>
    <p class="mb-4 text-gray-500 font-thin text-md leading-relaxed">You are always free to mint a Pie on your own by issuing liquidity. Go check the Index page and select the right Pie for you.</p>
  </div>
  <a href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
    <button class="btn m-0 mt-4 rounded-8px p-15px min-w-200px w-96pc lg:w-200px lg:min-w-200px">
      Issue liquidity
    </button>
  </a>
</section>



