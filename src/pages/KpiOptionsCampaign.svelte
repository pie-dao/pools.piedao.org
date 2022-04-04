<script>
  import images from '../config/images.json';
  import Meta from '../components/elements/meta.svelte';
  import { stakingStats } from '../stores/eth/writables';
  import { toNum } from '../helpers/staking.js';

  import StakingSummary from '../components/kpi-options/Summary.svelte';

  let maxBarValue = 15000000;
  let totalStakedDough = 0;

  $: if ($stakingStats.totalStakedDough) {
    totalStakedDough =
      toNum($stakingStats.totalStakedDough) <= maxBarValue
        ? toNum($stakingStats.totalStakedDough)
        : maxBarValue;

    currentBarPercentage = Math.round((totalStakedDough * 100) / maxBarValue);
  }
</script>

<Meta
  metadata={{
    title: 'Stake DOUGH, PieDAO Governance Token, and get a monthly income!',
    description:
      'Contribute and be rewarded every month for building a better organization and products',
    image: images.herodough,
    imageAlt: 'Full-time Token Holder, the future of work is here.',
  }}
/>

<div class="flex flex-col items-center text-center mt-6 md:mt-10 mx-8">
  <div class="flex flex-col items-center w-full max-w-1100px pb-10 px-0 md:px-10">
    <div class="flex flex-col items-center font-thin">
      <img
        class="w-40pc md:w-80pc"
        src={images.umaprotocol}
        alt="umaprotocol"
        data-aos="fade-up"
        data-aos-delay="50"
      />
      <span class="text-base md:text-xl mb-2" data-aos="fade-up" data-aos-delay="100"
        >KPI Options</span
      >
    </div>
    <img
      class="crisp"
      src={images.two_m_prize}
      alt="kpi options"
      data-aos="fade-up"
      data-aos-delay="150"
    />
    <div
      class="text-base md:text-lg font-thin text-center mt-4"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      Congratulations!<br />
      <br/>Everyone that staked DOUGH during October 2021 is eligible.
      <br/>Redeem the KPI options distributed in November starting on April 3, 2022.
      <br/>Check your balance below and claim your veDOUGH!
    </div>
  </div>
</div>

<!-- PROGRESS BAR FOR MOBILE -->




<div class="w-full flex flex-col items-center text-center">
  <div
    class="w-full flex flex-row lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full justify-center">
      <StakingSummary />
    </div>
  </div>

  <div
    class="mt-8 w-full flex flex-col md:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <a
      style="background-color: #4dd5de; color: white;"
      target="_blank"
      href="https://piedao.notion.site/Staking-User-Manual-dc84c8c2ca194e34ac0775fc2485ab14"
      class="flex flex-col w-full md:w-1/3 justify-center pointer rounded h-200px m-2"
    >
      <div class="flex flex-row w-full text-center items-center mb-8 pl-8 pr-8">
        <img
          class="ml-40pc max-h-80px"
          src="https://github.com/pie-dao/brand/blob/master/misc/cut-of-meat_1f969.png?raw=true"
          alt=""
          data-aos="fade-up"
          data-aos-delay="50"
        />
      </div>
      Staking<br />User Guide
    </a>
    <a
      style="background-color: #ff4b4a; color: white;"
      target="_blank"
      href="https://medium.com/piedao/launching-uma-kpi-options-for-dough-staked-ee57ed6a10e7"
      class="flex flex-col w-full md:w-1/3 justify-center pointer p-8 rounded h-200px m-2"
    >
      <div class="flex flex-row w-full text-center items-center mb-8 md:mb-12 md:pl-8 md:pr-8">
        <img
          class="w-full max-h-80px"
          src="https://github.com/pie-dao/brand/blob/master/misc/uma-uma-logo_1.svg?raw=true"
          alt=""
          data-aos="fade-up"
          data-aos-delay="50"
        />
      </div>
      Learn about<br />UMA KPI Options
    </a>
    <a
      style="background-color: #5a65ea; color: white;"
      target="_blank"
      href="https://discord.link/PieDAO"
      class="flex flex-col w-full md:w-1/3 justify-center pointer p-8 rounded h-200px m-2"
    >
      <div class="flex flex-row w-full text-center items-center mb-8">
        <img
          class="w-full max-h-80px"
          src="https://github.com/pie-dao/brand/blob/master/misc/discord_1.svg?raw=true"
          alt=""
          data-aos="fade-up"
          data-aos-delay="50"
        />
      </div>
      Join our<br />Discord
    </a>
  </div>
</div>

<div class="flex flex-col items-center text-center mx-8 mt-4">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="text-base text-center">
      <p class="my-4">
        Congratulations! We managed to hit our initial milestone of over 20% DOUGH staked in under a WEEK, thanks to the community.
      </p>
      <img class="h-150px inline mb-4" src={images.astronaut} alt="hourglass_rounded" />
    </div>
    <a
      target="_blank"
      href="https://twitter.com/intent/tweet?text=Stake%20%24Dough%20and%20get%20monthly%20income%20%F0%9F%92%B8%21%20Stake%20your%20DOUGH%2C%20vote%20on%20proposals%20and%20claim%20your%20monthly%20rewards.%20250%2B%20members%20joined%20in%20the%20first%20month%21%20%F0%9F%99%8B%E2%80%8D%E2%99%82%EF%B8%8F%F0%9F%99%8B%E2%80%8D%E2%99%80%EF%B8%8F%F0%9F%99%8B%0A%0AGo%20to%20https%3A%2F%2Fwww.piedao.org%2F%23%2Fdough-staking-campaign%20to%20find%20out%20more%0A%0A%40PieDAO_DeFi%0A%23fulltimetokenholder"
      class="btnbig mt-4 w-200px text-white rounded-8px p-15px"
      data-url="https://www.piedao.org/#/dough-staking-campaign"
      data-hashtags="fulltimetokenholder"
      data-related="PieDAO_DeFi"
      data-show-count="false"
    >
      Share
    </a>
  </div>
</div>
