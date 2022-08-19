<script>
  import { onMount } from 'svelte';
  import filter from 'lodash/filter';
  import get from 'lodash/get';
  import poolsConfig from '../../config/pools.json';
  import { piesMarketDataStore } from '../../stores/coingecko.js';
  import { pools } from '../../stores/eth.js';
  import Meta from '../../components/elements/meta.svelte';
  import LightSimulator from '../simulator/Light_simulator.svelte';
  import images from '../../config/images.json';
  import FeaturedIn from '../../components/FeaturedIn.svelte';
  import AuditedBy from '../../components/AuditedBy.svelte';
  import Newsletter from '../../components/Newsletter.svelte';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { farming } from '../../stores/eth/writables.js';
  import { getTokenImage, formatFiat } from '../../components/helpers.js';
  import { fade } from 'svelte/transition';
  import HowTo from '../../components/HowToGovernance.svelte';
  import HowToVideo from '../../components/HowToGovernanceVideo.svelte';
  import Proposals from '../../components/elements/Proposals.svelte';
  import { fetchLastSnapshots } from '../../helpers/snapshopt.js';

  let proposals;

  onMount(async () => {
    try {
      proposals = await fetchLastSnapshots();
    } catch (error) {
      console.error(error);
    }
  });

  const views = [HowTo, HowToVideo];
  let viewportComponent = null;
  let currentView = 0;

  function toggleView() {
    currentView = currentView == 0 ? 1 : 0;
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView];
  }

  updateViewportComponent();

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

  let price = 'n/a';

  $: pies =
    filter(
      poolsConfig.available.map((address) => {
        let change = get(
          $piesMarketDataStore,
          `${address}.market_data.price_change_percentage_24h`,
          0,
        );
        return {
          ...poolsConfig[address],
          address,
          icon: getTokenImage(address),
          totalLiquidity: $pools[`${address}-usd`]
            ? formatFiat($pools[`${address}-usd`].toFixed(2).toString())
            : '-',
          totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
          change: change ? change : 0,
          nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
        };
      }),
      { isExperipie: false },
    ) || [];

  $: piVaults =
    filter(
      poolsConfig.available.map((address) => {
        let change = get(
          $piesMarketDataStore,
          `${address}.market_data.price_change_percentage_24h`,
          0,
        );
        let price = get($piesMarketDataStore, `${address}.market_data.current_price`, 0);
        return {
          ...poolsConfig[address],
          address,
          icon: getTokenImage(address),
          totalLiquidity: $pools[`${address}-usd`]
            ? formatFiat($pools[`${address}-usd`].toFixed(2).toString())
            : '-',
          totalLiquidityNum: $pools[`${address}-usd`] ? $pools[`${address}-usd`].toNumber() : 0,
          change: change ? change : 0,
          nav: $pools[`${address}-nav`] ? $pools[`${address}-nav`] : 0,
          price: price ? `$ ${price}` : `n/a`,
          rawPrice: price,
        };
      }),
      { isExperipie: true },
    ) || [];

  $: getNav = (token) => {
    return formatFiat($pools[token + '-nav'] ? $pools[token + '-nav'] : '');
  };

  $: (async () => {
    price = $farming['0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E'].DOUGHPrice.toFixed(2) || 0;
  })();
</script>

<Meta
  metadata={{
    title: 'PieDAO, the asset allocation DAO governing tokenized ETF products.',
    description:
      'An overview of the PieDAO mission and core products, including BCP, DEFI+L and DEFI++ DEFI index. ',
    image: images.defimadesimple,
    imageAlt: 'Investors examine spreadsheets and DEFI index opportunities',
  }}
/>

<div class="relative py-20">
  <div class="absolute inset-x-0 -top-48 -bottom-14 overflow-hidden bg-indigo-50">
    <img
      alt=""
      src={images.background_marketing}
      width="918"
      height="1495"
      decoding="async"
      class="absolute z-0 top-0 left-0 translate-y-[-10%] translate-x-[-55%] -scale-x-100 sm:left-1/2 sm:translate-y-[-6%] sm:translate-x-[-98%] lg:translate-x-[-106%] xl:translate-x-[-122%]"
    />
    <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white" />
    <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white" />
  </div>
  <div class="relative content flex flex-col px-4 py-20">
    <div class="mx-auto max-w-2xl lg:max-w-4xl lg:px-20">
      <h1
        class="text-5xl font-bold inline bg-gradient-to-r from-[#ed1ea0] via-[#6c5dfe] to-[#ed1ea0] bg-clip-text tracking-tight text-transparent leading-12"
      >
        PieDAO is a decentralized autonomous organization, or DAO, that develops, governs, and grows
        DeFi products.
      </h1>
      <div class="mt-12 space-y-6 font-display text-sm tracking-tight text-blue-900">
        <p>
          PieDAO does not run its own Frontend. To interact with the protocol, users may consider
          connecting to any frontend hosted by members of the PieDAO community.
        </p>
      </div>
    </div>
    <a
      class="items-center stakinggradient shake text-black text-left mt-12 hover:opacity-80"
      data-aos="fade-up"
      data-aos-delay="250"
      href="https://forum.piedao.org/t/ipfs-link-to-access-piedao-applications/1379"
      target="_blank"
      rel="noreferrer noopener"
    >
      <div class="w-100pc flex items-center">
        <div class="m-10px">
          <img class="h-50px inline" src={images.doughtoken} alt="doughtoken" />
        </div>
        <div class="mr-20px">
          <div class="text-base font-bold leading-5">More info</div>
          <div class="text-sm font-thin"><strong>on this</strong></div>
        </div>
      </div>
    </a>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-20 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1240px bg-lightgrey rounded pb-12 px-10">
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.hourglass} alt="hourglass" /><span
        >Long term<br />alignment</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.gem} alt="gem" /><span
        >Rewarded<br />commitment</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.pirateflag} alt="pirate flag" /><span
        >Treasury revenues<br />distribution</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.womanlaptop} alt="woman laptop" /><span
        >The future of work<br />is DAO</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.raisedhand} alt="raised hand" /><span
        >Hybrid governance<br />beyond coin vote</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.finger_point} alt="finger point" /><span
        >Over 480<br />stakeholders</span
      >
    </div>
    <div class="min-w-150px flex flex-col items-center leading-5 mt-12">
      <img class="h-50px inline mb-4" src={images.sparkle} alt="sparkle" /><span
        ><span>Participation rate<br />over 50%</span>
      </span>
    </div>
  </div>
</div>

<LightSimulator />

{#if viewportComponent == views[currentView]}
  <div class="flex flex-col items-center text-center mt-4 md:mt-20 mx-4 md:mx-8">
    <div class="w-full max-w-1240px">
      <div
        class="w-full flex flex-col lg:flex-row items-center md:max-w-700px lg:max-w-1280px"
        id="viewport"
        on:click={toggleView}
        on:outroend={updateViewportComponent}
        transition:fade
      >
        <svelte:component this={viewportComponent} />
      </div>
    </div>
  </div>
{/if}

<div class="flex flex-col items-center text-center md:pt-20 pb-10 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1100px pb-8 md:pb-12 px-4 md:px-10">
    <div class="w-full font-huge text-center mt-10">Doughconomics</div>
    <div class="w-full font-thin text-l text-center mt-20px">
      This is how the DAO makes money and how is redistributing them to the system
    </div>
    <a href="/#/dough-staking-campaign" class="font-bold text-base text-center">
      Learn more about staking >
    </a>
  </div>
  <div class="hidden md:block">
    <LottiePlayer
      src="https://assets10.lottiefiles.com/private_files/lf30_wksf88hl.json"
      autoplay={true}
      loop={true}
      controls={false}
      renderer="svg"
      background="white"
      height=""
      width="100%"
      {controlsLayout}
    />
  </div>
  <div class="block md:hidden">
    <img class="w-100% inline mb-4" src={images.doughconomics} alt="dough economics diagram" />
  </div>
</div>

<div class="flex flex-col items-center justify-center text-center mt-4 md:mt-2 mx-4 md:mx-8">
  <div
    class="flex flex-col justify-center md:justify-around w-full max-w-1240px bg-lightgrey rounded pb-4 md:pb-16 px-4 md:px-12"
  >
    <div class="font-huge text-center mt-10">Last votes</div>
    <div class="font-thin text-l text-center mt-20px">
      Participate on the last Governance decisions
    </div>
    {#if proposals}
      <Proposals {proposals} />
    {/if}
  </div>
</div>

<Newsletter />
<FeaturedIn />
<AuditedBy />

<div class="flex flex-col items-center text-center mt-4 md:mt-4 mb-8 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-center w-full max-w-1240px mb-4 px-10">
    <img class="h-40px inline" src={images.hourglass} alt="hourglass" />
    <img class="h-40px inline mx-4" src={images.gem} alt="gem" />
    <img class="h-40px inline" src={images.pirateflag} alt="pirate flag" />
  </div>
  <a
    target="_blank"
    href="https://medium.com/piedao/piedao-is-expanding-the-core-team-and-open-sourcing-the-search-for-talent-b22fce733293"
    class="font-bold text-pink text-base text-center"
  >
    We're hiring >
  </a>
</div>
