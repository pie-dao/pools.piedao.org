<script>
  import BigNumber from "bignumber.js";
  import images from "../config/images.json";
  import { farming } from '../stores/eth/writables.js';
  import StakingStats from '../components/staking/Stats.svelte';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import moment from 'moment';
  
  import {
    subscribeToBalance,
  } from "../components/helpers.js";

  import Meta from '../components/elements/meta.svelte';
   
   import {
    balanceKey,
    balances,
    contract,
  } from "../stores/eth.js";

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
</script>

<Meta 
    metadata={{
        title: "Stake DOUGH, PieDAO Governance Token, and get a monthly income!",
        description: "Contribute and be rewarded every month for building a better organization and products",
        image: images.herodough,
        imageAlt: "Full-time Token Holder, the future of work is here."
    }}
/>

<div>
  <div class="content flex flex-col spl px-4">
    <div class="flex flex-col items-center font-thin">
      <span class="text-l">
        <img src={images.umaprotocol} alt="umaprotocol"/>
      </span>
      <span class="text-xl">KPI Options</span>
    </div>
    <img src={images.tokenholderherotype} class="crisp bg-black" alt="dough" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-lg font-thin text-center mt-4 leading-8" data-aos="fade-up" data-aos-delay="200">if 15M DOUGH is staked<br />by 30th March 2022</div>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-4 md:mx-8">
  <div class="flex flex-wrap justify-around w-full max-w-1240px bg-lightgrey rounded p-6">
    <div class="min-w-150px flex flex-col items-center leading-5">
      <span>progress bar goes here</span>
    </div>

  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-0 mx-8">
  <div class="flex flex-wrap justify-around w-1/2 max-w-1100px px-10">
    <div class="text-l text-center mt-20px">
      <p class="p-4">
        if we managed to hit the milestone of over 20% DOUGH staked in under a week by the efforts of a handful of individuals, can you imagine where we can get by coordinated efforts or several-thousand people community? Sky is the limit.
      </p>
      <img class="h-150px inline mb-4" src={images.astronaut} alt="hourglass" />
    </div> 
  <button 
    onclick="location.href='/#/dough-staking';"
    class="btnbig mt-4 text-white rounded-8px p-15px">
  Stake DOUGH
  </button>
  </div>
</div>


<div class="w-full flex flex-col items-center text-center">
  <div class="flex w-full justify-center">
    <StakingStats />
  </div>
</div>


<div class="flex flex-col items-center text-center">
  <div class="flex flex-wrap justify-around w-full max-w-1100px px-10">
    <div class="w-full font-huge text-center mt-4">How can i participate?</div>
    <div class="w-full font-thin text-l text-left mt-20px">
      <p>To be eligible for the KPI option airdrop, you need to have veDOUGH (i.e. stake your DOUGH)
      by the 31st of October. The amount of KPI options you will receive will be pro-rata to the share of 
      veDOUGH you hold versus the total (up-to-date totals can be found here).</p>
      <br />
      <ul>
        <li>• To learn how to stake DOUGH, go to our <a target="_blank" href="https://discord.gg/DpZ2tMt6" class="pointer"><u>user guide for Staking</u></a></li>
        <li>• To learn more about UMA KPI options, <a target="_blank" href="https://discord.gg/DpZ2tMt6" class="pointer"><u>head here</u></a></li>
        <li>• For any other questions or help, <a target="_blank" href="https://discord.gg/DpZ2tMt6" class="pointer"><u>join our Discord</u></a></li>
      </ul>
      <br />
      <p>
        Try our staking simulator here to estimate how much monthly cashflows you can get for a given DOUGH amount and your desired lock-up period.
      </p>
    </div>
    <button 
      onclick="location.href='/#/staking-simulator';"
      class="btnbig mt-4 text-white rounded-8px p-15px">
      Staking Simulator
    </button>  
  </div>
</div>
  