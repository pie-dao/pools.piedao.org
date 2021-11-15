<script>
	import orderBy from 'lodash/orderBy';
  import BigNumber from 'bignumber.js';
  import get from 'lodash/get';
  import find from 'lodash/find';
  import filter from 'lodash/filter';
  import poolsConfig from "../config/pools.json";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { pools, eth } from '../stores/eth.js';
  import StakingSummary from '../components/staking/Summary.svelte';

  import {
    fetchBalances,
    getNormalizedNumber,
    roundDownLabel
  } from '../helpers/multicall';

  import {
    getTokenImage,
  } from "../components/helpers.js";

  import Holdings from "../components/piefolio/Holdings.svelte";
  import Allocation from "../components/piefolio/Allocation.svelte";
  import Oven from "../components/piefolio/Oven.svelte";
  import Governance from "../components/piefolio/Governance.svelte";
  import Banner from "../components/piefolio/Banner.svelte";

  $: portfolioUSD = 0;

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
  let currentAddress = null;

  $: featured = [];
  $: tokens = [];

  $: if($eth.address) {
    if(currentAddress != $eth.address) {
      currentAddress = $eth.address;

      (async () => {
        portfolioUSD = 0;
        await fetchOnchainData();
        await fetchTokenList($eth.address);
        await initStakingSummary();
      })()
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

    featured = orderBy(res.slice(1).map(t => {
      const usdValue = t.market_data ? t.balance.number * t.market_data.current_price : 0;
      portfolioUSD += usdValue;
      return {
        ...t,
        usdValue
      }
    }), ['usdValue'], ['desc']);
  }

  async function fetchTokenList(address) {
    const response = await fetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=scwf7425sUxrtI106`)
    const result = await response.json();
    if (!result.tokens) {
      tokens = [];
      return tokens;
    };

    const allTokens = result.tokens.map( t => {
      const decimal = parseInt(t.tokenInfo.decimals, 10)
      const balanceNumber = parseFloat(getNormalizedNumber(t.balance, decimal).toString());
      const usdValue = t.tokenInfo.price ? balanceNumber * t.tokenInfo.price.rate : 0;
      return {
        symbol: t.tokenInfo.symbol,
        name: t.tokenInfo.name,
        decimals: decimal,
        info: t.tokenInfo,
        usdValue,
        icon: getTokenImage(t.tokenInfo.address.toLowerCase()),
        balance: {
          bn:  new BigNumber(t.balance),
          label: roundDownLabel(getNormalizedNumber(t.balance, decimal).toString()),
          number: balanceNumber
        }
      };
    });

    const filtered = filter(allTokens, (t) => {
      if(t.info.holdersCount === 0) return false;
      if(t.name.includes('www') || t.name.includes('WWW')) return false;
      if(find(featured, (o) => o.address.toLowerCase() === t.info.address.toLowerCase())) return false;
      portfolioUSD += t.usdValue;
      return true;
    })

    tokens = orderBy(filtered, ['usdValue'], ['desc']);
  }

</script>


<div class="hidden md:flex w-100pc py-20px flex flex-col items-center">
  <div class="flex items-start mx-4 md:max-w-1280px">
    <div class="flex flex-col w-60pc mr-2pc">
      <span class="mb-4"><Holdings totalVal={portfolioUSD} tokenList={featured} /></span>
      <span class="mt-2 mb-2"><Allocation totalVal={portfolioUSD} tokenList={tokens}/></span>
    </div>
    <div class="flex flex-col w-38pc">
      <StakingSummary />
      <span class="mt-2 mb-1"><Banner /></span>
      <span class="mt-1"><Oven /></span>
      <!-- <span class="mt-1 mb-1"><Farming /></span> -->
      <!-- <span class="mt-1 mb-1"><Exchange /></span> -->
      <span><Governance /></span>
    </div>
</div>
</div>

<div class="flex md:hidden flex-col mx-2">
  <span class="flex flex-col mb-2"><Banner /></span>
  <span class="flex flex-col mb-2"><Holdings totalVal={portfolioUSD} tokenList={featured} /></span>
  <span class="flex flex-col mb-2 h-100pc"><Allocation totalVal={portfolioUSD} tokenList={tokens} /></span>
  <div class="flex flex-col mb-7">
    <StakingSummary />
  </div>
  <span class="-mt-20px mb-2"><Oven /></span>
  <span class="-mt-20px mb-2"><Governance /></span>
  <!-- <span class="-mt-20px mb-2"><Farming /></span> -->
  <!-- <span class="-mt-20px"><Exchange /></span> -->

</div>

 



  