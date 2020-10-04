<script>
  import BigNumber from 'bignumber.js';
  import BalanceSmall from '../components/BalanceSmall.svelte';
  import FarmerTable from '../components/FarmerTable.svelte';
  import { currentRoute } from '../stores/routes.js';
  import poolsConfig from "../config/pools.json";
  import { CoinGecko, piesMarketDataStore } from '../stores/coingecko.js';
  import { pools } from '../stores/eth.js';
  import images from "../config/images.json";

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  $: pies = (poolsConfig.selectable.map(address => {
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-'
    };
  }) || [])

  const addToken = (pie) => {
    ethereum.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          "type":"ERC20",
          "options":{
            "address": pie.address,
            "symbol": pie.symbol,
            "decimals": 18,
            "image": pie.icon,
          },
        },
        id: Math.round(Math.random() * 100000),
    }, (err, added) => {
      if (added) {
        console.log('Thanks for your interest!')
      } else {
        alert('Something went wrong. Is Metamask there?')
      }
    })
  };
</script>

<div class="content flex flex-col spl">

  <img alt="ready to diversify?" src={images.banner} />
  <div class="w-99pc m-4">

    <div class="my-10">
      <h1 class="text-lg">🥧 Explore Pies</h1>
      <p class="font-thin">An Entire Portfolio in a Single Token</p>
    </div>
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Pie name</th>
          <th class="font-thin border-b-2 px-4 py-2 hidden md:block">Assets</th>
          <th class="font-thin border-b-2 px-4 py-2">Liquidity</th>
          <th class="font-thin border-b-2 px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {#each pies as pie}
          <tr>
            <td class="border border-gray-800 px-2 py-2 text-left">
                <a href={`#/pie/${pie.address}`}>
                  <img
                    class="inline icon ml-2 mr-2"
                    src={pie.icon}
                    alt={pie.symbol} />
                    {pie.symbol}
                </a>
            </td>
            <td class="border text-center px-4 py-2 hidden md:block">
              {#each pie.composition as coin}
                <img
                  class="close-icons inline icon"
                  src={getTokenImage(coin.address)}
                  alt={coin.symbol} />
              {/each}
            </td>
            <td class="border text-center px-4 py-2">
              <a href={`#/pie/${pie.address}`}>
                {pie.totalLiquidity}
              </a>
            </td>
            
            <td class="border text-center px-4 py-2">
              <a target="_blank" href={`https://balancer.exchange/#/swap/ether/${pie.address}`}>
                <button class="table-btn highlight-box">
                  Buy
                </button>
              </a>
            </td>
            <td class="border text-center px-4 py-2">
              <a href={`#/pools/${pie.address}`}>
                <button class="table-btn">
                  Mint
                </button>
              </a>
            </td>
            <td class="border text-center py-2">
              <a href={`#/pools/${pie.address}/withdraw/multi`}>
                <button class="table-btn">
                  Redeem
                </button>
              </a>
            </td>
            <td class="border text-center py-2">
              <button on:click={() => addToken(pie)} class="table-btn">
                Add to MetaMask 🦊
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="my-10">
      <h1 class="text-lg">👨‍🌾 Honest worker? Explore Pie Farming Opportunities</h1>
      <p class="font-thin">Add liquidity to earn fees and DOUGH incentives.</p>
    </div>

    <FarmerTable />
  </div>
</div>
