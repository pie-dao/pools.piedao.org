<script>
  import images from "../config/images.json";
  import StakingStats from '../components/staking/Stats.svelte';
  import Meta from '../components/elements/meta.svelte';
  import ProgressBar from '@okrad/svelte-progressbar';
  import { stakingStats } from '../stores/eth/writables';
  import { toNum } from '../helpers/staking.js';
  import { formatFiat } from '../components/helpers.js';

  let progressBarText = "";
  let progressBarPlot = false;
  let maxBarValue = 15000000;
  let currentBarPercentage = 0;
  let progressBarWidth = window.innerWidth * 0.9;
  let totalStakedDough = 0;

  $: if($stakingStats.totalStakedDough) {
    totalStakedDough = toNum($stakingStats.totalStakedDough)
    progressBarText = `already staked 	&nbsp; <b>${formatFiat(totalStakedDough, ',', '.', '')} DOUGH</b>`;
    currentBarPercentage = (totalStakedDough * 100) / maxBarValue;
    progressBarPlot = true;
  }

  window.addEventListener('resize', function(event) {
    console.log("RESIZE", event, window.innerWidth, window.innerHeight);
  });

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
        <img src={images.umaprotocol} alt="umaprotocol" class="w-1/2 ml-25pc"/>
      </span>
      <span class="text-xl">KPI Options</span>
    </div>
    <img src={images.tokenholderherotype} class="crisp bg-black" alt="dough" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-lg font-thin text-center mt-4 leading-8" data-aos="fade-up" data-aos-delay="200">if 15M DOUGH is staked<br />by 30th March 2022</div>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10 mx-4 md:mx-8 min-h-50px">  
  <div class="flex flex-wrap justify-around w-full rounded inner">
    {#if progressBarPlot}
      <ProgressBar
        series={[currentBarPercentage]} 
        valueLabel={`<img src="${images.doughtoken}" alt="dough" width="10%" class="p-5"/> ${progressBarText}`}
        invLabelColor= true
        width={progressBarWidth}
        height='50'
        textSize='100'
        rx='25'
        ry='25'
        labelAlignX='left'
        thresholds={[
          {
            till: currentBarPercentage,
            color: '#38fe61'
          }         
        ]}
      /> 
    {:else}
      <ProgressBar
        series={[0]} 
        valueLabel={`<img src="${images.doughtoken}" alt="dough" width="10%" class="p-5"/>Loading...`}
        invLabelColor= true
        width={progressBarWidth}
        height='50'
        textSize='100'
        rx='25'
        ry='25'
        labelAlignX='left'
      />  
    {/if}   
  </div> 

  {#if progressBarPlot}
    <div class="bg-transparent rounded h-50px w-90pc inner">
      <table class="w-full text-right">
        <tr>
          <td class="inner text-center" style="margin-left: 44%;">
            {#if totalStakedDough >= 7000000}
              <img src={images.checkmark_rounded} alt="dough" class="w-30px pt-2"/>
            {:else}
              <img src={images.hourglass} alt="dough" class="w-25px pt-3"/>
            {/if}
          </td>
          <td class="inner text-center" style="margin-left: 64%;">
            {#if totalStakedDough >= 10000000}
            <img src={images.checkmark_rounded} alt="dough" class="w-30px pt-2"/>
          {:else}
            <img src={images.hourglass} alt="dough" class="w-25px pt-3"/>
          {/if}
          </td>
          <td class="inner text-center" style="margin-left: 94%;">
            {#if totalStakedDough >= 15000000}
            <img src={images.checkmark_rounded} alt="dough" class="w-30px pt-2"/>
          {:else}
            <img src={images.hourglass} alt="dough" class="w-25px pt-3"/>
          {/if}
          </td>
        </tr>
      </table>
    </div>  
  {/if} 
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-0 mx-8">
  <div class="flex flex-wrap justify-around w-full md:w-1/2 max-w-1100px">
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
        <li>• To learn how to stake DOUGH, go to our <a target="_blank" href="https://piedao.notion.site/Staking-User-Manual-dc84c8c2ca194e34ac0775fc2485ab14" class="pointer"><u>user guide for Staking</u></a></li>
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
  