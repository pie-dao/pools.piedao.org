<script>
	import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from "../../config/pools.json";
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { pools } from '../../stores/eth.js';
  import Meta from '../../components/elements/meta.svelte';
  import images from "../../config/images.json";
  import FeaturedIn from '../../components/FeaturedIn.svelte';
  import AuditedBy from '../../components/AuditedBy.svelte';
  import Contributors from '../../components/Contributors.svelte';
  import Newsletter from '../../components/Newsletter.svelte';
  import Change from '../../components/Change.svelte';
  import WhiteBox from '../../components/elements/WhiteBox.svelte';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';

  import {
    getTokenImage,
    formatFiat,
  } from "../../components/helpers.js";

      // lottie...
      let controlsLayout = [
    'previousFrame',
    'playpause',
    'stop',
    'nextFrame',
    'progress',
    'frame',
    'loop',
    'spacer',
    'background',
    'snapshot',
    'zoom',
    'info',
  ];

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
      price: price ? `$ ${price}` : `n/a`,
      rawPrice: price
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

<a class="w-full flex justify-center items-center" href="#/simulator">
  <div class="w-full mx-4">
    <img src="https://github.com/pie-dao/brand/blob/master/misc/Homepage-Banner.jpg?raw=true" class="w-full crisp rounded" alt="dough" data-aos="fade-up" data-aos-delay="150"/>
  </div>
</a>

<div class="videocontainer">
  <video loop muted autoplay poster="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughvideobg2.jpg" class="bg_video">
    <source src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/doughbgvidlow.mp4" type="video/mp4" data-aos="fade-up" data-aos-delay="500">
  </video>
  <div class="content flex flex-col spl px-4">
    <div class="text-24px font-bold md:text-lg md:leading-8 text-center mb-4" data-aos="fade-up" data-aos-delay="100">PieDAO’s<br />Governance Token</div>
    <img src={images.doughcolorful} class="crisp" alt="dough" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-lg font-thin text-center mt-4 leading-8" data-aos="fade-up" data-aos-delay="200">Contribute and be rewarded<br />for building a better organizazion and products.</div>
    <button class="items-center stakinggradient shake text-black text-left mt-4 hover:opacity-80" onclick="location.href='https://app.1inch.io/#/1/swap/ETH/DOUGH';" data-aos="fade-up" data-aos-delay="250">
      <div class="w-100pc flex items-center">
      <div class="m-10px"><img class="h-50px inline" src={images.doughtoken} alt="doughtoken" /></div>
      <div class="mr-20px">
        <div class="text-base font-bold leading-5">Buy DOUGH</div>
        <div class="text-sm font-thin">Current price: <strong>tanto</strong></div>
      </div>
    </div>
    </button>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1240px bg-lightgrey rounded pb-12 px-10">
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.hourglass} alt="hourglass" /><span>Long term<br />alignment</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.gem} alt="gem" /><span>Rewarded<br />commitment</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.pirateflag} alt="pirate flag" /><span>Treasury revenues<br />distribution</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.womanlaptop} alt="woman laptop" /><span>The future of work<br />is DAO</span></div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12"><img class="h-50px inline mb-4" src={images.raisedhand} alt="raised hand" /><span>Hybrid governance<br />beyond coin vote</span></div>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1100px pb-12 px-10">
    <div class="font-huge text-center mt-10">A new governance model</div>
    <div class="font-thin text-l text-center mt-20px">
      DOUGH is the basic element to start your journey and be part of the PieDAO family.
      <br /><br />
      If you stake DOUGH for a minimum of 6 months, you get in exchange veDOUGH, PieDAO’s governance token.
      <br /><br />  
      With veDOUGH you can help the community steer the destiny of the DAO and its products, make proposals, vote on issues while being compensated for your commitment and effort.
      <br /><br />  
      In fact PieDAO redistributes 60% of the revenues generated by its products and treasury management to active community members, proportionally to the amount of veDOUGH they hold.
    </div>  
  </div>
</div>


<div class="content text-center" style="padding-bottom: 0!important;">
  <span class="mt-6 mb-0 px-2 md:px-8 italic text-lg block md:hidden leading-7 font-thin">"A decentralized asset manager for tokenized portfolios, with a mission to bring automated wealth creation to everyone with an internet connection."</span>
  <span class="mt-12 mb-4 px-8 italic font-huge hidden md:block" data-aos="fade-up" data-aos-delay="500">"A decentralized asset manager for tokenized portfolios, with a mission to bring automated wealth creation to everyone with an internet connection."</span>
</div>


<div class="w-100pc m-w-100pc mr-4 md:m-0 p-0 flex justify-center overflow-x-scroll md:overflow-x-hidden hidescrollbar">
  <div class="w-100pc md:max-w-1200px flex items-start justify-start md:justify-center self-center pt-4 pb-0 md:py-4 px-4 hidescrollbar md:flex-wrap">  
  
  {#each piVaults as pie}
    {#if pie.address !== '0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e'}
      <div class="min-w-80pc md:min-w-30pc md:w-30pc md:mx-3 mr-4 my-2 md:my-3 rounded-xl flex pointer scale cardbordergradient">
        <a href={`#/pie/${pie.address}`}>

          <div class="px-4 py-2 flex flex-col">
            <div class="flex items-center">
            <img class="mt-2 mb-4 w-60px h-60px mr-3" src={pie.icon} alt={pie.symbol} />
            <div class="flex flex-col">
            <span class="text-lg leading-6">{pie.symbol}</span>
            <span class="flex items-center font-base font-thin text-sm">{pie.price}&nbsp; &nbsp;<Change class="text-sm" value={pie.change} /></span>
          </div>
        </div>
            <span class="font-thin text-sm mb-1 opacity-70">{poolsConfig[pie.address].description}</span>
            <div class="text-left mt-2 pt-2 mb-0 flex items-center justify-between border-thin-top">
              <span class="block md:hidden mr-1">🔥 </span>
              <span class="flex items-center font-thin text-sm opacity-70 leading-4"><span class="hidden md:block">🔥 </span>
              Since inception <strong class="ml-2 text-black">{(parseFloat(pie.rawPrice-1)*100).toFixed(2)}%</strong></span><a href={`#/swap`}><button class="btn-text-pink min-w-70px mt-2 mb-2 text-right">BUY</button>
          </div>
        </a>
      </div>
      {/if}
  {/each}

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
            <div class="text-left mt-2 pt-2 mb-0 flex items-center justify-between border-thin-top"><span class="block md:hidden mr-1">🔥 </span><span class="flex items-center font-thin text-sm opacity-70 leading-4"><span class="hidden md:block">🔥 </span>Since inception 
              <strong class="ml-2 text-black">{((parseFloat($pools[pie.address+"-nav"] ? $pools[pie.address+"-nav"] : 0)-1) *100).toFixed(2)}%</strong></span>
              <a href={`#/swap`}><button class="btn-text-pink min-w-70px mt-2 mb-2 text-right">BUY</button>
          </div>
        </a>
      </div>
    {/if}
  {/each}

    <div class="block inline-block md:hidden" style="margin-right:2rem!important;">&nbsp;</div>
  </div>
</div>




<div class="content">
  <div class="flex flex-col md:flex-row p-4 md:p-10 mx-2 md:mx-4 md:mx-0 rounded gradientbglightblue">
    <!-- <img class="w-60px mb-4 block md:hidden" src={images.piechart_illustration} alt="PieDAO chart illustration" /> -->
    <div class="text-lg text-left w-100pc block md:hidden leading-7 mb-2">Pies are diversified portfolios of top performing crypto assets</div>
    <div class="font-huge text-left w-1/2 pr-2 hidden md:block">Pies are diversified portfolios of top performing crypto assets</div>
    <ul class="text-left font-thin font-base w-100pc md:w-1/2 md:pl-4 list-outside list-none">
      <li class="mt-3 md:mt-0">✔️ Carefully handpicked by a decentralized community of economically incentivised talent.</li>
      <li class="mt-3">✔️ Maximize returns with active yield-generating strategies behind the scenes. Staking, lending, yield-farming - completely automated. </li>
      <li class="mt-3">✔️ Accessible. Save 97% of the minting gas costs by using the community Oven</li>
      <li class="mt-3">✔️ Secure architecture and fully audited contracts </li>
    </ul>
  </div>
</div>

<div class="flex flex-col items-center text-center md:mt-10 mx-8 mb-20">
  <div class="flex flex-wrap justify-around w-full max-w-1100px pb-12 px-10">
    <div class="w-full font-huge text-center mt-10">Doughconomics</div>
    <div class="w-full font-thin text-l text-center mt-20px">
      This is how the DAO makes money and how is redestrebuting them to the system
    </div> 
    <a href="#/simulator" class="font-bold text-base text-center">
      Learn more about staking >
    </a>   
  </div>
  <div class="hidden md:block">
    <LottiePlayer
    src="https://assets10.lottiefiles.com/private_files/lf30_wksf88hl.json"
    autoplay="{true}"
    loop="{true}"
    controls="{false}"
    renderer="svg"
    background="white"
    height=""
    width="100%"
    controlsLayout="{controlsLayout}"
    />
  </div>
  <div class="block md:hidden">
    <img class="w-100% inline mb-4" src={images.doughconomics} alt="dough economics diagram" />
  </div>
</div>

<Newsletter />
<FeaturedIn />
<AuditedBy />

<div class="flex flex-col items-center text-center mt-4 md:mt-4 mb-8  mx-8">
  <div class="flex flex-wrap justify-center w-full max-w-1240px mb-4 px-10">
    <img class="h-40px inline" src={images.hourglass} alt="hourglass" />
    <img class="h-40px inline mx-4" src={images.gem} alt="gem" />
    <img class="h-40px inline" src={images.pirateflag} alt="pirate flag" />
  </div>
  <a target="_blank" href="https://medium.com/piedao/piedao-is-expanding-the-core-team-and-open-sourcing-the-search-for-talent-b22fce733293" class="font-bold text-pink text-base text-center">
    We're hiring >
  </a>   
</div>

