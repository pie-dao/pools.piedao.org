<script>
  import get from 'lodash/get';

  import poolsConfig from "../config/pools.json";
  import { CoinGecko, piesMarketDataStore } from '../stores/coingecko.js';
  import { pools } from '../stores/eth.js';
  import images from "../config/images.json";

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  import Change from '../components/Change.svelte'

    $: pies = (poolsConfig.selectable.map(address => {
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
  }) || []);

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

    export let value;
</script>


<div class="w-99pc">
    <table class="breakdown-table table-auto w-full">
        
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Protocol</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Proposal</th>
          <th class="font-thin border-b-2 px-4 py-2">Status</th>
          <th class="font-thin border-b-2 px-4 py-2">End Date</th>
          <th class="font-thin border-b-2 px-4 py-2"></th>
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

            <td class="pointer border px-4  py-2 text-left" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              Ongoing Contributor Feddas, Organizations Operations
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              Active
            </td>
            <td class="pointer border px-4 ml-8 py-2 font-thin text-center" on:click={() => window.location.hash = `#/pie/${pie.address}`}>
              23 Dec
            </td>
            <td class="border px-4 ml-8 py-2 font-thin text-center">
                <button class="table-btn highlight-box min-w-70px">
                  Vote
                </button>
  

             
            </td>
            
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

