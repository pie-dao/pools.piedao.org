<script>
	import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from "../../config/pools.json";
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { pools } from '../../stores/eth.js';
  import Meta from '../../components/elements/meta.svelte';
  import images from "../../config/images.json";
  import FeaturedIn from '../../components/FeaturedIn.svelte';
  import Contributors from '../../components/Contributors.svelte';
  import Newsletter from '../../components/Newsletter.svelte';
  import Change from '../../components/Change.svelte';
  import WhiteBox from '../../components/elements/WhiteBox.svelte';

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
    <div class="max-w-1200px flex flex-col items-center justify-center py-0 md:py-8 px-2">
    <!-- <img class="w-90pc block md:hidden mb-2"  src={images.herolandingmobile} alt="PieDAO Hero" /> -->
    <img class="md:w-90pc lg:w-80pc hidden md:block"  src={images.herolanding} alt="PieDAO Hero" />
    <div class="text-black font-bold text-center font-hero linear-wipe">Automated<br class="hidden md:block lg:block"/> wealth creation</div>
    <div class="text-lg text-black font-thin italic text-center mt-1">Decentralized Finance <br class="block md:hidden lg:hidden"/>Made Easy</div>
    <a href="#/pies"><button class="btnbig text-white m-0 mt-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Get started</button></a>
    <div class="w-100pc flex flex-col md:flex-row items-stretch text-left mt-6 mb-0 md:mt-10 md:mb-6 text-black font-bold text-base">
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon2} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Set and forget strategies, <br class="hidden md:block" />maximum returns</span>
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon1} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Diversified exposure to <br class="hidden md:block" />the best of crypto</span>  
      </div>
      <div class="flex w-100pc justify-start items-center md:justify-center mt-2 md:mx-3 md:mt-0 md:w-1/3 bg-black-alpha rounded py-4 px-4">
        <img class="w-40px" src={images.heroicon3} alt="PieDAO Hero" />
        <span class="ml-4 leading-5">Secure, transparent, <br class="hidden md:block" />and open-source</span>
      </div>
    </div>
  </div>
</div>


<div class="content text-center" style="padding-bottom: 0!important;">
  <span class="mt-6 mb-0 px-2 md:px-8 italic text-lg block md:hidden leading-7 font-thin">"A decentralized asset manager for tokenized portfolios, with a mission to bring automated wealth creation to everyone with an internet connection."</span>
  <span class="mt-12 mb-4 px-8 italic font-huge hidden md:block">"A decentralized asset manager for tokenized portfolios, with a mission to bring automated wealth creation to everyone with an internet connection."</span>
</div>


<div class="w-100pc m-w-100pc mr-4 md:m-0 p-0 flex justify-center overflow-x-scroll md:overflow-x-hidden hidescrollbar">
  <div class="w-100pc md:max-w-1200px flex items-start justify-start md:justify-center self-center pt-4 pb-0 md:py-4 px-4 hidescrollbar md:flex-wrap">  

  {#each pies as pie}
  {#if pie.address !== '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd'}
  <div class="min-w-80pc md:min-w-30pc md:w-30pc md:mx-3 mr-4 my-2 md:my-3 rounded-xl flex pointer scale cardbordergradient">
    <a href={`#/pie/${pie.address}`}>

      <div class="px-4 py-2 flex flex-col">
        <div class="flex items-center">
        <img class="mt-2 mb-4 w-60px h-60px mr-3" src={pie.icon} alt={pie.symbol} />
        <div class="flex flex-col">
        <span class="text-lg leading-6">{pie.symbol}</span>
        <span class="flex items-center font-base font-thin text-sm">{getNav(pie.address)}&nbsp; &nbsp;<Change class="text-sm" value={pie.change} /></span>
      </div>
    </div>
        <span class="font-thin text-sm mb-1 opacity-70">{poolsConfig[pie.address].description}</span>
        <div class="text-left mt-2 pt-2 mb-0 flex items-center justify-between border-thin-top"><span class="block md:hidden mr-1">🔥 </span><span class="flex items-center font-thin text-sm opacity-70 leading-4"><span class="hidden md:block">🔥 </span>Since inception <strong class="ml-2 text-black">+{(parseFloat($pools[pie.address+"-nav"] ? $pools[pie.address+"-nav"] : 0)*100).toFixed(2)}%</strong></span><a href={`#/swap`}><button class="btn-text-pink min-w-70px mt-2 mb-2 text-right">BUY</button>
      </div>
    </a>
  </div>
  {/if}
  {/each}

    <div class="block inline-block md:hidden" style="margin-right:2rem!important;">&nbsp;</div>
  </div>
</div>


<section class="pt-8 px-4 text-center md:pt-8 lg:pt-12">
  <div class="w-full max-w-2xl mx-auto">
    <div class="text-lg text-center w-100pc block md:hidden leading-7 mb-6">Bake Together, save 97% Gas.<br /><a href="#/oven" class="underline"> Use the oven ></a></div>
    <div class="font-huge text-center w-100pc pr-2 hidden md:block">Bake Together, save 97% Gas.</div>
  </div>
</section>

<div class="w-100pc flex justify-center">
  <div class="flex flex-col md:max-w-1200px p-0 p-4 md:p-6 mx-4 md:mx-0 mb-0 md:mb-4 items-center bg-lightgrey md:bg-white rounded">
    <div class="flex flex-col justify-between content-center lg:flex-row leading-5">

        <div class="flex flex-row md:flex-col w-100pc lg:w-1/3 md:min-h-150px items-center my-0 lg:m-10px p-0 md:p-20px">
          <img class="w-50px md:w-80px mr-4 md:mr-0" src={images.depositeth} alt="deposit eth" />
          <div class="flex flex-col text-left md:text-center md:mt-3">
              <div class="text-lg">Deposit ETH</div>
              <div class="font-thin mt-1 md:mt-2">When at least 10 ETH is deposited the Oven can begin.</div>
          </div>
        </div>

        <div class="flex flex-row md:flex-col w-100pc lg:w-1/3 md:min-h-150px items-center mt-4 md:my-0 lg:m-10px p-0 md:p-20px">
          <img class="w-50px md:w-80px mr-4 md:mr-0" src={images.waitoven} alt="wait oven" />
          <div class="flex flex-col text-left md:text-center md:mt-3">
              <div class="text-lg">Wait</div>
              <div class="font-thin mt-1 md:mt-2">Oven will bake when gas price is below 100 gwei, saving everyone money.</div>
          </div>
        </div>

        <div class="flex flex-row md:flex-col w-100pc lg:w-1/3 md:min-h-150px items-center mt-4 md:my-0 lg:m-10px p-0 md:p-20px">
          <img class="w-50px md:w-80px mr-4 md:mr-0 mb-2 md:mb-0" src={images.sharegascost} alt="share gas cost" />
          <div class="flex flex-col text-left md:text-center md:mt-3">
            <div class="text-lg">Withdraw Your Pie</div>
            <div class="font-thin mt-1 md:mt-2">Once the Pie is baked you can withdraw it to your wallet.</div>
          </div>
        </div>

    </div>
    <a href="#/oven" class="hidden md:block"><button class="btnblack m-0 mt-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Oven</button></a>

  </div>
</div>


<div class="content">
  <div class="flex flex-col md:flex-row p-4 md:p-10 mx-2 md:mx-4 md:mx-0 rounded gradientbglightblue">
    <!-- <img class="w-60px mb-4 block md:hidden" src={images.piechart_illustration} alt="PieDAO chart illustration" /> -->
    <div class="text-lg text-left w-100pc block md:hidden leading-7 mb-2">Pies are diversified portfolios of top performing crypto assets</div>
    <div class="font-huge text-left w-1/2 pr-2 hidden md:block">Pies are diversified portfolios of top performing crypto assets</div>
    <ul class="text-left font-thin font-base w-100pc md:w-1/2 md:pl-4 list-outside list-none">
      <li class="mt-3 md:mt-0">✔️ Carefully handpicked by a decentralized community of crypto natives who live and breathe DEFI</li>
      <li class="mt-3">✔️ Maximize returns with active yield-generating strategies under the hood</li>
      <li class="mt-3">✔️ Accessible. Save 97% of the minting gas costs by using the community Oven</li>
      <li class="mt-3">✔️ Secure architecture and fully audited contracts </li>
    </ul>
  </div>
</div>


<div class="videocontainer-landing mt-2 mb-6 md:my-6 py-20 md:py-30">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video-landing hidden md:block">
    <source class="hidden md:block" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4">
  </video>
  <div class="content flex flex-col spl px-4 z-50">
    <!-- <div class="text-lg font-bold md:text-xl text-center mb-1 mt-6">Want a slice of the pie?</div> -->
    <img src={images.doughcolorful} class="w-60pc md:w-30pc" alt="dough" />
    <div class="text-base md:text-lg font-thin text-center mt-2">The engine behind PieDAO’s self-driving <br class="hidden md:block" />wealth creation machine</div>
    <a href="#/dough"><button class="btnblack m-0 mt-4 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Get started</button></a>
  </div>
</div>


<Contributors />
<Newsletter />
<FeaturedIn />

