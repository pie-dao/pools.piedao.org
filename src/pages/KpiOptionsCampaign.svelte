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
  let progressBarWidth = window.innerWidth * 0.6;
  let totalStakedDough = 0;

  $: if($stakingStats.totalStakedDough) {
    totalStakedDough = toNum($stakingStats.totalStakedDough);
    progressBarText = `<b>${formatFiat(totalStakedDough, ',', '.', '')} DOUGH</b>`;
    currentBarPercentage = Math.round((totalStakedDough * 100) / maxBarValue);
    progressBarPlot = true;
  }
</script>

<Meta 
    metadata={{
        title: "Stake DOUGH, PieDAO Governance Token, and get a monthly income!",
        description: "Contribute and be rewarded every month for building a better organization and products",
        image: images.herodough,
        imageAlt: "Full-time Token Holder, the future of work is here."
    }}
/>


  
<div class="flex flex-col items-center text-center mt-6 md:mt-10 mx-8">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="flex flex-col items-center font-thin">
        <img class="w-40pc md:w-80pc" src={images.umaprotocol} alt="umaprotocol" data-aos="fade-up" data-aos-delay="50"/>
      <span class="text-base md:text-xl mb-2" data-aos="fade-up" data-aos-delay="100">KPI Options</span>
    </div>
    <img class="crisp" src={images.five_m_prize} alt="kpi options" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-base md:text-lg font-thin text-center mt-4" data-aos="fade-up" data-aos-delay="200">if 15M DOUGH is staked<br />by 30th March 2022</div>
  </div>

</div>

{#key progressBarWidth}
<!-- PROGRESS BAR FOR MOBILE -->
<div class="md:hidden flex flex-row m-55pc">
  <div class="md:hidden verticalProgressBar min-h-50px flex flex-col items-center text-center pt-10px"> 
    <div class="rounded h-50px inner" style={`width: ${Math.round(progressBarWidth * 2.1)}px; margin-top: -100px;`}>
      <div class="inner ml-38pc w-80px horizontalText">
        {#if totalStakedDough >= 7000000}
          <img src={images.one_m_prize_text_bg} alt="" style="position:relative; left: -25%;" />
        {:else}
          <img src={images.one_m_prize_text} alt="" />
        {/if}
      </div>
      <div class="inner ml-60pc w-80px horizontalText">
        {#if totalStakedDough >= 10000000}
          <img src={images.two_m_prize_text_bg} alt="" style="position:relative; left: -25%;" />
        {:else}
          <img src={images.two_m_prize_text} alt="" />
        {/if}
      </div>
      <div class="inner ml-88pc w-80px horizontalText">
        {#if totalStakedDough >= 15000000}
          <img src={images.five_m_prize_text_bg} alt="" style="position:relative; left: -25%;" />
        {:else}
          <img src={images.five_m_prize_text} alt="" />
        {/if}
      </div>           
    </div>   
  </div>

  <div class="md:hidden min-h-50px mt-55pc mb-55pc verticalProgressBar flex flex-col items-center text-center">  
    <div class="flex flex-wrap justify-around w-full rounded inner">
      {#if progressBarPlot}
        <ProgressBar
          series={[currentBarPercentage]} 
          valueLabel={'	&nbsp;	&nbsp;	&nbsp; ' + progressBarText}
          invLabelColor= true
          width={Math.round(progressBarWidth * 2.1)}
          height='50'
          textSize='100'
          rx='25'
          ry='25'
          labelAlignX='leftOf400'
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
          valueLabel={`	&nbsp;	&nbsp;	&nbsp; Loading...`}
          invLabelColor= true
          width={Math.round(progressBarWidth * 2.1)}
          height='50'
          textSize='100'
          rx='25'
          ry='25'
          labelAlignX='left'
        />  
      {/if}   
    </div> 

    {#if progressBarPlot}
      <div class="rounded h-50px inner" style={`width: ${Math.round(progressBarWidth * 2.1)}px;`}>
        <img src={images.green_ball} alt="dough" class={`w-50px ml-${Math.round(currentBarPercentage) - 5}pc`}/>
      </div>
      <div class="rounded h-50px inner" style={`width: ${Math.round(progressBarWidth * 2.1)}px;`}>
        <table class="w-full text-right">
          <tr>
            <td class="inner text-center" style="margin-left: 44%;">
              <div class="border-dashed border-r-2 h-30px w-15px mt-1 inner" style="top: -28px;"></div>
              {#if totalStakedDough >= 7000000}
                <img src={images.checkmark_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {:else}
                <img src={images.hourglass_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {/if}
              <div class="border-dashed border-r-2 h-30px w-15px mt-1"></div>
            </td>
            <td class="inner text-center" style="margin-left: 64%;">
              <div class="border-dashed border-r-2 h-30px w-15px mt-1 inner" style="top: -28px;"></div>
              {#if totalStakedDough >= 10000000}
                <img src={images.checkmark_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {:else}
                <img src={images.hourglass_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {/if}
              <div class="border-dashed border-r-2 h-30px w-15px mt-1"></div>
            </td>
            <td class="inner text-center" style="margin-left: 92%;">
              <div class="border-dashed border-r-2 h-30px w-15px mt-1 inner" style="top: -28px;"></div>
              {#if totalStakedDough >= 15000000}
                <img src={images.checkmark_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {:else}
                <img src={images.hourglass_rounded} alt="dough" class="w-30px mt-2 horizontalText"/>
              {/if}
              <div class="border-dashed border-r-2 h-30px w-15px mt-1"></div>
            </td>
          </tr>
        </table>
      </div>  
    {/if} 
  </div>

  <div class="md:hidden verticalProgressBar min-h-50px flex flex-col items-center text-center mt-55pc mb-55pc pt-100px"> 
    <div class="rounded h-50px inner" style={`width: ${Math.round(progressBarWidth * 2.1)}px;`}>
      <div class="inner ml-36pc w-100px horizontalText">
        7M DOUGH Staked
      </div>
      <div class="inner ml-56pc w-100px horizontalText">
        10M DOUGH Staked
      </div>
      <div class="inner ml-86pc w-100px horizontalText">
        15M DOUGH Staked
      </div>        
    </div>   
  </div>
</div>  
<!-- PROGRESS BAR FOR MOBILE -->
{/key}


<!-- nico PROGRESS BAR FOR DESKTOP -->
<div class="hidden md:block">
  <div class="flex flex-col items-center text-center mt-6 md:mt-10 mx-8">
    <div class="flex flex-col items-center w-full max-w-1100px px-0 md:px-10">
      <div class="w-full h-100px p-0 m-0 relative">
        <div class="z-50 flex items-center absolute w-100pc h-100px top-8pc">
          <div class="flex flex-col items-center absolute ml-41pc text-center">
            {#if totalStakedDough >= 7000000}
              <img src={images.one_m_prize_text_bg} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mb-22px"></div>
            {:else}
              <img src={images.one_m_prize_text} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mt-10px"></div>
            {/if}
          </div>
          <div class="flex flex-col items-center absolute ml-61pc text-center">
            {#if totalStakedDough >= 10000000}
              <img src={images.two_m_prize_text_bg} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mb-20px"></div>
            {:else}
              <img src={images.two_m_prize_text} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mt-10px"></div>
            {/if}
          </div>
          <div class="flex flex-col items-center absolute ml-90pc text-center">
            {#if totalStakedDough >= 15000000}
              <img src={images.five_m_prize_text_bg} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mb-22px"></div>
            {:else}
              <img src={images.five_m_prize_text} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mt-12px"></div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center text-center mx-8">
    <div class="flex flex-col items-center w-full max-w-1100px px-0 md:px-10">
      <div class="w-full bg-lightgrey rounded-circle h-44px p-0 m-0 relative">
        <div class="z-40 flex items-center absolute w-100pc h-44px max-w-100pc">
          <div class="px-25px absolute ml-41pc">
            {#if totalStakedDough >= 7000000}
              <img src={images.checkmark_rounded} alt="checked" width="30px"/>
            {:else}
              <img src={images.hourglass_rounded} alt="checked" width="30px"/>
            {/if}
            </div>
          <div class="px-25px absolute ml-59pc lg:ml-61pc">
            {#if totalStakedDough >= 10000000}
              <img src={images.checkmark_rounded} alt="checked" width="30px"/>
            {:else}
              <img src={images.hourglass_rounded} alt="checked" width="30px"/>
            {/if}
          </div>
          <div class="pl-25px absolute ml-90pc">
            {#if totalStakedDough >= 15000000}
              <img src={images.checkmark_rounded} alt="checked" width="30px"/>
            {:else}
              <img src={images.hourglass_rounded} alt="checked" width="30px"/>
            {/if}
          </div>
        </div>
        <div class={`flex items-center w-${currentBarPercentage}pc bg-electricgreen rounded-circle h-44px m-0`}>
          <img src="{images.arrow_right}" alt="dough" width="75px" class="ml-4 mr-2 hidden lg:block"/>
          <span class="font-thin ml-4 lg:ml-0 mr-2 hidden lg:block">Already staked</span>
          <span class="font-bold ml-4 lg:ml-0">{formatFiat(totalStakedDough, ',', '.', '')} DOUGH</span>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center text-center mx-8 -mt-10px">
    <div class="flex flex-col items-center w-full max-w-1100px px-0 md:px-10">
      <div class="w-full h-90px p-0 m-0 relative">
        <div class="z-50 flex items-center absolute w-100pc h-90px text-center leading-5 mt-3">
          <div class="w-80px flex flex-col items-center absolute ml-41pc">
            <div class="w-1px h-30px dashed"></div><span class="mt-2">7M DOUGH<br />Staked</span>
          </div>
          <div class="w-80px flex flex-col items-center absolute ml-61pc">
            <div class="w-1px h-30px dashed"></div><span class="mt-2">10M DOUGH<br />Staked</span>
          </div>
          <div class="w-80px flex flex-col items-center absolute ml-90pc">
            <div class="w-1px h-30px dashed"></div><span class="mt-2">15M DOUGH<br />Staked</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- nico PROGRESS BAR FOR DESKTOP -->


<div class="flex flex-col items-center text-center mx-8 mt-4">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="text-base text-center">
      <p class="my-4">
        If we managed to hit the milestone of over 20% DOUGH staked in under a week by the efforts of a handful of individuals, can you imagine where we can get by coordinated efforts for several-thousand people community? Sky is the limit.
      </p>
      <img class="h-150px inline mb-4" src={images.astronaut} alt="hourglass_rounded" />
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

<div class="flex flex-col items-center text-center mt-6 md:mt-10 mx-8">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="w-full font-huge text-center mt-4">How can I participate?</div>
    <div class="w-full font-thin text-l text-left mt-20px">
      <p>To be eligible for the KPI option airdrop, you need to have veDOUGH (i.e. stake your DOUGH)
      by the 31st of October. The amount of KPI options you will receive will be pro-rata to the share of 
      veDOUGH you hold versus the total (up-to-date totals can be found here).</p>
      <br />
      <ul>
        <li>• To learn how to stake DOUGH, go to our <a target="_blank" href="https://piedao.notion.site/Staking-User-Manual-dc84c8c2ca194e34ac0775fc2485ab14" class="pointer"><u>user guide for Staking</u></a></li>
        <li>• To learn more about UMA KPI options, <a target="_blank" href="https://medium.com/piedao/launching-uma-kpi-options-for-dough-staked-ee57ed6a10e7" class="pointer"><u>head here</u></a></li>
        <li>• For any other questions or help, <a target="_blank" href="https://discord.gg/DpZ2tMt6" class="pointer"><u>join our Discord</u></a></li>
      </ul>
      <br />
      <p>
        Try our staking simulator here to estimate how much monthly cashflows you can get for a given DOUGH amount and your desired lock-up period.
      </p>
    </div>
    <button 
      onclick="location.href='/#/staking-simulator';"
      class="btnbig mt-8 text-white rounded-8px p-15px">
      Staking Simulator
    </button>  
  </div>
</div>
