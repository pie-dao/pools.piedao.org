<script>
  import { onMount } from 'svelte';
  import BigNumber from 'bignumber.js';
  import orderBy from 'lodash/orderBy';
  import { get } from 'svelte/store';
  import { ethers } from "ethers";
  import poolsConfig from "../config/pools.json";
  import { pools, contract } from '../stores/eth.js';
  import { farming } from '../stores/eth/writables.js';
  import { piesMarketDataStore } from '../stores/coingecko.js';

  import { fetchNav } from '../helpers/tvl.js';

  import {
    calculateAPRBalancer,
    calculateAPRUniswap,
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  import incentivizedPools from '../config/farmingConf.js';



  $: pies = orderBy((poolsConfig.available.map(address => {
    return {
      ...poolsConfig[address],
      address,
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0
    };
  }) || []), ['totalLiquidityNum'], ['desc']);


  $: pieLiquidity = (() => {
      let total = 0;
      pies.forEach(el => {
          // Do not double count assets in DEFI++
          if(el.address != "0x8d1ce361eb68e9e05573443c407d4a3bed23b033") {
            total += el.totalLiquidityNum;
          }
          
      });
      console.log('pieLiquidity', total);
      return total;
  })();

  $: stakedLiquidity = 0;
  
  const calcStakedLiquidity = async () => {
      let total = 0;
      const marketData = get(piesMarketDataStore);

      incentivizedPools.forEach( p => {
        if($farming[p.addressUniPoll]) {
            let partialTotal = $farming[p.addressUniPoll].totalStakedBPTAmount * $farming[p.addressUniPoll].BPTPrice;

            if( p.id == 3 || p.id == 4 ) {
                const pieStaked = $farming[p.addressUniPoll].doughStaked;
                partialTotal -= pieStaked * marketData[ p.containing[0].address ].market_data.current_price;
            } 

            total += partialTotal
        }
      });

      return total;
  };

  $: rows = [
      {type: 'Pie', amount: pieLiquidity},
      {type: 'Staked', amount: stakedLiquidity},
  ]



  window.addEventListener('price-update', async function (e) {
    const promises = incentivizedPools.map( async pool => {
        if( pool.type === 'UniswapV2') {
            return await calculateAPRUniswap(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
        }
        else if( pool.type === 'Balancer') {
            return await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
        }
        else {
            return Promise.resolve();
        }
    });

    await Promise.all(promises);
    stakedLiquidity = await calcStakedLiquidity();
    console.log('stakedLiquidity', stakedLiquidity);
  }, false);

  onMount( async () => {
    //await fetchNav();
  });

  </script>


  <div class="hidden md:flex w-100pc gradientanimation py-2 text-sm justify-center">
    <div class="flex items-center justify-between text-white w-100pc max-w-1280px mx-4">
      <div class="mr-12"><span class="font-thin mr-2">TVL:</span><span class="font-bold">{formatFiat((pieLiquidity+stakedLiquidity).toFixed(2).toString())}</span></div>
      <div class="mr-12"><span class="font-thin mr-2">DOUGH Price:</span><span class="font-bold">$1.45</span></div>
      <div class="mr-12"><span class="font-thin mr-2">DAO Members:</span><span class="font-bold">4500</span></div>
      <div class="mr-12"><span class="font-thin mr-2">Proposal submitted:</span><span class="font-bold">4500</span></div>
      <div><span class="font-thin mr-2">Open votes:</span><span class="font-bold">4500</span></div>
    </div>
  </div>