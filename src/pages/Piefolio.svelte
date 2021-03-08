<script>
  import { onMount } from 'svelte';
  import io from 'socket.io-client';
  import get from 'lodash/get';
  import poolsConfig from "../config/pools.json";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { pools, eth } from '../stores/eth.js';

  import {
    fetchBalances,
  } from '../helpers/multicall';

  import {
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";



  import Holdings from "../components/piefolio/Holdings.svelte";
  import Allocation from "../components/piefolio/Allocation.svelte";
  import Oven from "../components/piefolio/Oven.svelte";
  import Governance from "../components/piefolio/Governance.svelte";
  import Farming from "../components/piefolio/Farming.svelte";
  import Banner from "../components/piefolio/Banner.svelte";
  import Exchange from "../components/piefolio/Exchange.svelte";

  $: isLoading = false;
  $: initialized = {
    onMount: false,
    onChainData: false
  };

  $: pies = poolsConfig.available.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
    };
  }) || [];

  $: featured = [];

  $: if($eth.address) {
    if(!initialized.onChainData && !isLoading) {
      isLoading = true;
      fetchOnchainData();
      initialized.onChainData = true;
      isLoading = false;
    }
  }

  async function fetchOnchainData() {
    // Fetch balances, allowance and decimals
    let res = await fetchBalances(
      [
        {
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          symbol: 'ETH',
          icon: getTokenImage('eth')
        },
        ...pies
      ],
      $eth.address,
      $eth.provider
    )

    featured = res.slice(1);
    console.log('listed', featured)
    
  }

  onMount(async () => {
    // const newAddressSocket = createSocket('address');
    // listenOnAddressMessages(newAddressSocket)
    // newAddressSocket.on(messages.CONNECT, () => {
    //   console.log('I\'m connected!');
    // });
  });

</script>


<div class="hidden md:flex w-100pc py-20px flex flex-col items-center">
  <div class="flex items-start mx-4 md:max-w-1280px">
    <div class="flex flex-col w-60pc mr-2pc">
      <span class="mb-4"><Holdings tokenList={featured} /></span>
      <span class="mt-2 mb-2"><Allocation /></span>
    </div>
    <div class="flex flex-col w-38pc">
      <span class="mb-1"><Banner /></span>
      <span class="mt-1 mb-1"><Oven /></span>
      <span class="mt-1 mb-1"><Farming /></span>
      <!-- <span class="mt-1 mb-1"><Exchange /></span> -->
      <span class="mt-1 mb-1"><Governance /></span>
    </div>
</div>
</div>

<div class="flex md:hidden flex-col mx-2">
  <span class="mb-2"><Banner /></span>
  <span class="mb-2"><Holdings /></span>
  <span class="mb-2"><Allocation /></span>
  <span class="-mt-20px mb-2"><Oven /></span>
  <span class="-mt-20px mb-2"><Governance /></span>
  <span class="-mt-20px mb-2"><Farming /></span>
  <span class="-mt-20px"><Exchange /></span>

</div>

 



  