<script>
  import {
    getTokenImage,
    formatFiat,
    calculateAPRBalancer
  } from "../components/helpers.js";

  import { farming } from '../stores/eth/writables.js';


  $: tokensSwapOut = [
    {
      symbol: "DOUGH/ETH",
      address: "",
      addressTokenToStake: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
      addressUniPoll: '0x8314337d2b13e1A61EadF0FD1686b2134D43762F',
      balance: '0',
      type: 'Balancer',
      weights: "80 / 20",
      aprEnabled: true,
      weeklyRewards: '200,000',
      poolLink: 'https://pools.balancer.exchange/#/pool/0xfae2809935233d4bfe8a56c2355c4a2e7d1fff1a/',
      containing: [
        {
          symbol: "DOUGH",
          address: "0xad32A8e6220741182940c5aBF610bDE99E737b2D",
          balance: '0',
          icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D')
        },
        {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+S/ETH",
      address: "",
      aprEnabled: false,
      balance: '0',
      weights: "70 / 30",
      addressTokenToStake: '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF',
      addressUniPoll: '0x220f25C2105a65425913FE0CF38e7699E3992B97',
      weeklyRewards: '25,000',
      poolLink: "https://pools.balancer.exchange/#/pool/0x35333cf3db8e334384ec6d2ea446da6e445701df/",
      type: 'Balancer',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+S/DAI",
      address: "",
      aprEnabled: false,
      addressTokenToStake: '0x7aeFaF3ea1b465dd01561B0548c9FD969e3F76BA',
      addressUniPoll: '0x64964cb69f40A1B56AF76e32Eb5BF2e2E52a747c',
      weights: "50 / 50",
      type: 'UniswapV2',
      poolLink: 'https://app.uniswap.org/#/add/0x6B175474E89094C44Da98b954EedeAC495271d0F/0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C',
      weeklyRewards: '25,000',
      balance: '0',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "DAI",
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
          balance: '0',
          icon: getTokenImage('0x6B175474E89094C44Da98b954EedeAC495271d0F')
        },
      ]
    },
  ];

  window.addEventListener('price-update', function (e) {
    console.log('price-update', e)
    tokensSwapOut.forEach( async pool => {
        if(pool.aprEnabled) {
          const res = await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, pool.containing[0].address, pool.containing[1].address);
        }  
    });
  }, false);

  $: console.log('farming', $farming);
</script>
<table class="breakdown-table table-auto w-full">
    <thead>
    <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left hidden md:block">Asset name</th>
        <th class="font-thin border-b-2 px-4 py-2">DEX</th>
        <th class="font-thin border-b-2 px-4 py-2">Weights</th>
        <th class="font-thin border-b-2 px-4 py-2">Weekly Rewards</th>
        <th class="font-thin border-b-2 px-4 py-2">APR (unstable)</th>
        <!-- <th class="font-thin border-b-2 px-4 py-2">APY</th> -->
    </tr>
    </thead>
    <tbody>
    {#each tokensSwapOut as pool}
        <tr>
        <td class="border border-gray-800 px-2 py-2 text-left hidden md:block">
            {#each pool.containing as coins}
            <img
                class="inline icon ml-2 mr-2"
                src={coins.icon}
                alt={pool.symbol} />
                ({coins.symbol})
            {/each}
        </td>
        <td class="border text-center px-4 py-2">
            {#if pool.type === 'UniswapV2'}
            🦄 Uniswap V2
            {/if}
            {#if pool.type === 'Balancer'}
            ⚖️ Balancer
            {/if}
        </td>
        <td class="border text-center px-4 py-2">
            {pool.weights}
        </td>
        <td class="border text-center px-4 py-2">
            {pool.weeklyRewards}
        </td>
        
        <td class="border text-center py-2">
          {#if $farming[pool.addressUniPoll]}
            {$farming[pool.addressUniPoll].apr}
          {:else}
            n/a
          {/if}
        </td>
        
        <td class="border text-center py-2">
          <a href="#/stake">
            <button class="table-btn">
              Stake
            </button>
          </a>
        </td>
        {#if pool.poolLink}
        <td class="border text-center py-2">
          <a href={`${pool.poolLink}`} target="_blank">
            <button class="table-btn">
              Add to Pool
            </button>
          </a>
        </td>
        {/if}
        </tr>
    {/each}
    </tbody>
</table>