<script>
  import {
    getTokenImage,
    formatFiat
  } from "../components/helpers.js";

  const tokensSwapOut = [
    {
      symbol: "DOUGH/ETH",
      address: "",
      balance: '0',
      type: 'Balancer',
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
      balance: '0',
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
</script>
<table class="breakdown-table table-auto w-full">
    <thead>
    <tr>
        <th class="font-thin border-b-2 px-4 py-2 text-left hidden md:block">Asset name</th>
        <th class="font-thin border-b-2 px-4 py-2">DEX</th>
        <th class="font-thin border-b-2 px-4 py-2">Weekly Rewards</th>
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
            {pool.weeklyRewards}
        </td>
        <!-- <td class="border text-center px-4 py-2">
            N/A
        </td> -->
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