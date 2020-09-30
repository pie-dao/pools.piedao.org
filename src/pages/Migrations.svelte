<script>
  import AllocationBreakdown from '../components/AllocationBreakdown.svelte';
  import Balance from '../components/Balance.svelte';
  import Etherscan from '../components/Etherscan.svelte';
  import Farming from '../components/Farming.svelte';
  import Info from '../components/Info.svelte';
  import Migration from '../components/Migration.svelte';
  import Quantstamp from '../components/Quantstamp.svelte';

  import { currentRoute } from '../stores/routes.js';

  import {
    getTokenImage,
  } from "../components/helpers.js";

  const tokensSwapOut = [
    {
      symbol: "USDC/ETH",
      address: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
      balance: '0',
      type: 'UniswapV2',
      containing: [
        {
          symbol: "USDC",
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          balance: '0',
          icon: getTokenImage('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
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
      address: "0x7aefaf3ea1b465dd01561b0548c9fd969e3f76ba",
      type: 'UniswapV2',
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

<div class="content flex flex-col">

  <div class="flex flex-col w-full flex-row-reverse md:flex-row">
    <div class="left flex-1">
      
      <div class="flex hidden md:block">
        <div class="left flex-1 mt-4 mr-4">
          <Farming token={$currentRoute.params.address} />
        </div>
      </div>
      <!-- <div class="hidden md:block">
        <Info token={$currentRoute.params.address} />
      </div> -->
      
    </div>
    
    <div class="right w-full md:w-2/4 flex md:flex-1 md:ml-2">
      <Migration 
        token={$currentRoute.params.address} 
        method={$currentRoute.params.method} 
        poolAction={$currentRoute.params.poolAction}
      />
    </div>
  </div>
</div>
