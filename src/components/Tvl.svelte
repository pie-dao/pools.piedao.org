<script>
  import BigNumber from 'bignumber.js';
  import orderBy from 'lodash/orderBy';
  import poolsConfig from "../config/pools.json";
  import { pools } from '../stores/eth.js';
  import { farming } from '../stores/eth/writables.js';

  import confetti from '../components/Confetti.js';

  import {
    calculateAPRBalancer,
    calculateAPRUniswap,
    getTokenImage,
    formatFiat,
  } from "../components/helpers.js";

  import incentivizedPools from '../config/farmingConf.js';

  const config = {
  angle: "166",
  spread: 360,
  startVelocity: "59",
  elementCount: "132",
  dragFriction: 0.12,
  duration: "4630",
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "499px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

  $: pies = orderBy((poolsConfig.selectable.map(address => {
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
      return total;
  })();

  $: stakedLiquidity = 0;
  
  const calcStakedLiquidity = () => {
      let total = 0;
      incentivizedPools.forEach( p => {
        if($farming[p.addressUniPoll])
            total += $farming[p.addressUniPoll].totalStakedBPTAmount * $farming[p.addressUniPoll].BPTPrice;
      });
      return total;
  };

  $: rows = [
      {type: 'Pie', amount: pieLiquidity},
      {type: 'Staked', amount: stakedLiquidity},
  ]

  const triggerConfetti = () => {
      const button = document.querySelector("#confetti")
      confetti(button, config);
  };

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
    stakedLiquidity = calcStakedLiquidity();

    if(pieLiquidity+stakedLiquidity > 10000000 && pieLiquidity+stakedLiquidity < 11000000) {
        triggerConfetti();
    }

  }, false);

  </script>

  <button on:click={triggerConfetti} id="totalLiquidityButton" class="table-btn highlight-box">
        TVL: {formatFiat((pieLiquidity+stakedLiquidity).toFixed(2).toString())}
  </button>