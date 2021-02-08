<script>
	import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from "../../config/pools.json";
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { pools } from '../../stores/eth.js';
  import Meta from '../../components/elements/meta.svelte';
  import images from "../../config/images.json";
  import FeaturedIn from '../../components/FeaturedIn.svelte';
  import Newsletter from '../../components/Newsletter.svelte';
  import Change from '../../components/Change.svelte'
  import Modal from '../../components/elements/Modal.svelte';
  import LiquidityModal from "../../components/modals/LiquidityModalSwitch.svelte";

  import {
    getTokenImage,
    formatFiat,
  } from "../../components/helpers.js";

  $: pies = filter(poolsConfig.available.map(address => {
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
  }), {isExperipie: false}) || [];

  $: piVaults = filter(poolsConfig.available.map(address => {
    let change = get($piesMarketDataStore, `${address}.market_data.price_change_percentage_24h`, 0)
    let price = get($piesMarketDataStore, `${address}.market_data.current_price`, 0)
    return {
      ...poolsConfig[address],
      address,
      icon: getTokenImage(address),
      totalLiquidity: $pools[`${address}-usd`] ? formatFiat( $pools[`${address}-usd`].toFixed(2).toString() ) : '-',
      totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
      change: change ? change : 0,
      nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
      price: price ? `$ ${price}` : `n/a`
    };
  }), {isExperipie: true}) || [];

  $: getNav =((token) => {
    return formatFiat($pools[token+"-nav"] ? $pools[token+"-nav"] : '')
  })
</script>

<Meta 
  metadata={{
    title: "PieDAO, the asset allocation DAO governing tokenized ETF products.",
    description: "An overview of the PieDAO mission and core products, including BCP, DEFI+L and DEFI++ DEFI index. ",
    image: images.defimadesimple,
    imageAlt: "Investors examine spreadsheets and DEFI index opportunities"
  }}
/>

  <div class="w-100pc m-0 p-0 flex justify-center">
    <div class="max-w-1200px flex flex-col items-center justify-center py-0 md:py-8 px-6">
    <img class="w-90pc block md:hidden mb-2"  src={images.herolandingmobile} alt="PieDAO Hero" />
    <img class="md:w-90pc lg:w-80pc hidden md:block"  src={images.herolanding} alt="PieDAO Hero" />
    <div class="text-black font-bold text-center font-hero linear-wipe">Wealth creation,<br class="hidden md:block lg:block"/> automated.</div>
    <div class="text-lg text-black font-thin italic text-center mt-1">“The latest hack in Decentralised Finance”</div>
    <a href="#/pies"><button class="btnbig text-white m-0 mt-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Get started</button></a>
    <div class="w-100pc flex flex-col md:flex-row items-stretch text-left mt-6 mb-0 md:mt-10 md:mb-6 text-white font-bold text-base">
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon2} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Set and forget strategies<br class="hidden md:block" />for maximum returns</span>
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon1} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Diversified exposure to<br class="hidden md:block" />crème de la crème in crypto</span>  
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon3} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Secure, transparent,<br class="hidden md:block" />and open-source</span>
      </div>
    </div>
  </div>
</div>


<div class="content font-huge text-left md:text-center" style="padding-bottom: 0!important;">
  <span class="mt-6 md:mt-12 mb-0 md:mb-4 px-6 italic">"A decentralised asset manager for tokenised portfolios, with a mission to bring automated wealth creation to everyone with an internet connection."</span>
</div>


<div class="w-100pc m-w-100pc mr-4 md:m-0 p-0 flex justify-center overflow-x-scroll hidescrollbar">
  <div class="w-100pc md:max-w-1200px flex items-start justify-start justify-items-start py-8 px-6 hidescrollbar">  
  {#each pies as pie}
    <a href={`#/pie/${pie.address}`} class="min-w-80pc md:min-w-31pc mr-4 md:mx-4 my-2 md:my-0 drowpdown-shadow rounded flex flex-col pointer scale">
      <div class="w-100pc flex justify-center py-16 gradientbglightgreen rounded-top">
      <img class="w-40pc h-40pc" src={pie.icon} alt={pie.symbol} />
    </div>
        <div class="p-4 flex flex-col">
        <span class="flex items-center"><span class="text-lg">{pie.symbol}</span><span class="text-lg font-thin mx-2">{getNav(pie.address)}</span><Change value={pie.change} /></span>
        <span class="font-thin text.base">Exposure to lower marketcap projects that have incredible potential for future growth</span>
        </div>
      </a>
  {/each}
    <div class="block inline-block md:hidden" style="margin-right:2rem!important;">&nbsp;</div>
</div>
</div>

<Newsletter />


<div class="flex rounded gradientbglightblue py-6 md:py-12 px-4 md:px-6 mx-6 md:mx-40 flex items-center justify-center">
  <div class="flex flex-col md:flex-row max-w-1200px px-2 md:px-8">
    <img class="w-70px mb-4 block md:hidden" src={images.piechart_illustration} alt="PieDAO chart illustration" />
    <div class="text-lg text-left w-100pc block md:hidden leading-8">Pies are diversified portfolios of top performing crypto assets</div>
    <div class="font-huge text-left w-1/2 hidden md:block">Pies are diversified portfolios of top performing crypto assets</div>
    <ul class="text-left font-thin text-base w-100pc md:w-1/2 md:pl-4 list-outside list-none">
      <li class="mt-4 md:mt-0">✔️ Carefully handpicked by a decentralised community of economically incentivised talent</li>
      <li class="mt-4">✔️ Maximised returns through latest-trend active strategies like staking, lending, and yield-farming - completely automated</li>
      <li class="mt-4">✔️ Low-cost onboarding, saving you 97% of Ethereum gas fees</li>
      <li class="mt-4">✔️ Architecture that enhances security & minimises risk </li>
    </ul>
  </div>
</div>




<div class="videocontainer my-6">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video-landing">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4">
  </video>
  <div class="content flex flex-col spl px-4 z-50">
    <div class="text-lg font-bold md:text-xl text-center mb-1 mt-6">Want a slice of the pie?</div>
    <img src={images.doughcolorful} class="w-100pc md:w-30pc" alt="dough" />
    <div class="text-base md:text-lg font-thin text-center mt-2">$DOUGH is the engine behind PieDAO’s self-driving <br class="hidden md:block" />wealth creation machine</div>
    <a href="#/dough"><button class="btnblack m-0 mt-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Get started</button></a>
  </div>
</div>

<FeaturedIn />
