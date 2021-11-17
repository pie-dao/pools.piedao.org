<script>
  import images from "../config/images.json";
  import StakingStats from '../components/staking/Stats.svelte';
  import Meta from '../components/elements/meta.svelte';
  import { stakingStats } from '../stores/eth/writables';
  import { toNum } from '../helpers/staking.js';
  import { formatFiat } from '../components/helpers.js';

  import StakingSummary from '../components/kpi-options/Summary.svelte';

  let maxBarValue = 15000000;
  let currentBarPercentage = 100;
  let totalStakedDough = 0;

  $: if($stakingStats.totalStakedDough) {
    totalStakedDough = toNum($stakingStats.totalStakedDough) <= maxBarValue 
      ? toNum($stakingStats.totalStakedDough)
      : maxBarValue;

    currentBarPercentage = Math.round((totalStakedDough * 100) / maxBarValue);
    console.log("currentBarPercentage", currentBarPercentage);
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
  <div class="flex flex-col items-center w-full max-w-1100px pb-10 px-0 md:px-10">
    <div class="flex flex-col items-center font-thin">
        <img class="w-40pc md:w-80pc" src={images.umaprotocol} alt="umaprotocol" data-aos="fade-up" data-aos-delay="50"/>
      <span class="text-base md:text-xl mb-2" data-aos="fade-up" data-aos-delay="100">KPI Options</span>
    </div>
    <img class="crisp" src={images.five_m_prize} alt="kpi options" data-aos="fade-up" data-aos-delay="150"/>
    <div class="text-base md:text-lg font-thin text-center mt-4" data-aos="fade-up" data-aos-delay="200">If 15M DOUGH are staked<br />by March 30th, 2022</div>
  </div>
</div>

<!-- PROGRESS BAR FOR MOBILE -->
<div class="md:hidden flex flex-row w-70pc ml-15pc">
  <div class="text-center w-full">
    <div class="flex flex-col items-center text-center">
      <div class="w-full h-500px p-0 m-0 relative">
        <div class="z-50 flex items-center absolute w-100pc h-500px">
          {#if totalStakedDough >= 7000000}
            <div class="flex flex-row items-center absolute bottom-35pc text-center">
              <img src={images.one_m_prize_text_bg} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>
          {:else}
            <div class="flex flex-row items-center absolute bottom-38pc text-center">
              <img src={images.one_m_prize_text} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>            
          {/if}
          {#if totalStakedDough >= 10000000}
            <div class="flex flex-row items-center absolute bottom-55pc text-center">
              <img src={images.two_m_prize_text_bg} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>
          {:else}
            <div class="flex flex-row items-center absolute bottom-58pc text-center">
              <img src={images.two_m_prize_text} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>            
          {/if}
          {#if totalStakedDough >= 15000000}
            <div class="flex flex-row items-center absolute bottom-86pc text-center">
              <img src={images.five_m_prize_text_bg} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>
          {:else}
            <div class="flex flex-row items-center absolute bottom-90pc text-center">
              <img src={images.five_m_prize_text} alt="" width="80px"/>
              <div class="h-1px w-35px dashed"></div>
            </div>            
          {/if}          
        </div>
      </div>     
    </div>
  </div>

  <div class="text-center w-50px">
    <div class="w-50px bg-lightgrey rounded-circle h-full p-0 m-0 relative">
      <div class="z-40 flex items-center absolute w-50px h-100pc">
        <div class={`absolute mb-1 left-12px bottom-40pc`}>
          {#if totalStakedDough >= 7000000}
            <img src={images.checkmark_rounded} alt="checked" width="25px"/>
          {:else}
            <img src={images.hourglass_rounded} alt="checked" width="25px"/>
          {/if}
          </div>
          <div class={`absolute mb-1 left-12px bottom-60pc`}>
          {#if totalStakedDough >= 10000000}
            <img src={images.checkmark_rounded} alt="checked" width="25px"/>
          {:else}
            <img src={images.hourglass_rounded} alt="checked" width="25px"/>
          {/if}
        </div>
        <div class={`absolute mb-1 left-12px bottom-91pc`}>
          {#if totalStakedDough >= 15000000}
            <img src={images.checkmark_rounded} alt="checked" width="25px"/>
          {:else}
            <img src={images.hourglass_rounded} alt="checked" width="25px"/>
          {/if}
        </div>
      </div>
      <div 
        style="height: {currentBarPercentage}%;"
        class={`absolute bottom-0 flex items-center bg-electricgreen rounded-circle w-50px m-0`}>
        <span class="font-bold w-50px m-25pc text-left items-left h-100pc mb-50px rotate180" style="writing-mode: vertical-lr; text-orientation: sideways-left;">{formatFiat(totalStakedDough, ',', '.', '')} DOUGH</span>
      </div>
    </div>
  </div>

  <div class="text-center w-full">
    <div class="flex flex-col items-center h-full">
      <div class="h-full w-full p-0 m-0 relative">
        <div class="z-50 flex items-center absolute w-full h-full text-center leading-5">
          <div class="w-80px flex flex-row items-center absolute bottom-38pc">
            <div class="h-1px w-30px dashed"></div><span>7M DOUGH<br />Staked</span>
          </div>
          <div class="w-80px flex flex-row items-center absolute bottom-57pc">
            <div class="h-1px w-30px dashed"></div><span>10M DOUGH<br />Staked</span>
          </div>
          <div class="w-80px flex flex-row items-center absolute bottom-88pc">
            <div class="h-1px w-30px dashed"></div><span>15M DOUGH<br />Staked</span>
          </div>
        </div>
      </div>
    </div>
  </div>    
</div>  
<!-- PROGRESS BAR FOR MOBILE -->

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
              <img class="pb-4px" src={images.two_m_prize_text} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mt-15px"></div>
            {/if}
          </div>
          <div class="flex flex-col items-center absolute pl-91pc lg:pl-90pc text-center">
            {#if totalStakedDough >= 15000000}
              <img src={images.five_m_prize_text_bg} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mb-22px"></div>
            {:else}
              <img class="pb-4px" src={images.five_m_prize_text} alt="" width="80px"/>
              <div class="w-1px h-30px dashed mt-15px"></div>
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
          <div class="px-25px absolute ml-61pc lg:ml-61pc">
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
        <div 
          style={`width: ${currentBarPercentage}%;`}
          class={`flex items-center bg-electricgreen rounded-circle h-44px m-0`}>
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

<div class="flex flex-col items-center text-center mt-6 md:mt-10 mx-8">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="w-full font-huge text-center mt-4">How can I participate?</div>
    <div class="w-full font-thin text-l text-center mt-20px">
      <p>Everyone that has staked Dough during October 2021 is eligible! 
        If you did check your address 
        <u><a href="https://bafybeifonjk7bchsdlljsbf4gywpcyuyn4634fddu2iccd6uzfyxmmkow4.ipfs.infura-ipfs.io/">here</a></u>
        <br />
         The options have been distributed already, check your balance in the summary below. 
         <br />
         <b>Now its time to pump those numbers up!</b>
        </p>
      <br />
      <div class="mt-8 w-full flex flex-row lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px">
        <div class="flex flex-col w-1/3 justify-center">
          <div class="flex flex-row w-full text-center items-center mb-2">
            <img class="w-full max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/1.svg?raw=true" 
            alt="" data-aos="fade-up" data-aos-delay="50"/>  
          </div>
          Stake DOUGH<br />by October 31st 2021<br />and claim kDOUGH
        </div>
        <div class="flex flex-col w-1/3 justify-center">
          <div class="flex flex-row w-full text-center items-center mb-2">
            <img class="w-full max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/2.svg?raw=true" 
            alt="" data-aos="fade-up" data-aos-delay="50"/>  
          </div>
          Invite as many people<br />as possible to stake<br />by March 30th 2022
        </div>
        <div class="flex flex-col w-1/3 justify-center">     
          <div class="flex flex-row w-full text-center items-center mb-2">
            <img class="w-full max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/3.svg?raw=true" 
            alt="" data-aos="fade-up" data-aos-delay="50"/>  
          </div>
          ue your kDOUGH to<br />redeem the<br />DOUGH payout
        </div>                
      </div> 
    </div>
  </div>
</div>

<div class="w-full flex flex-col items-center text-center">
  <div class="w-full font-huge text-center mt-4">Where we are right now</div>
  <div class="flex w-full justify-center">
    <StakingStats />
  </div>
  <div class="w-full flex flex-row lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px">
    <div class="flex flex-col w-full justify-center">
      <StakingSummary />
    </div>
  </div>  


  <div class="mt-8 w-full flex flex-row lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px">
    <a 
    style="background-color: #4dd5de; color: white;"
      target="_blank" href="https://piedao.notion.site/Staking-User-Manual-dc84c8c2ca194e34ac0775fc2485ab14"
      class="flex flex-col w-1/3 justify-center pointer rounded h-200px m-2">
      <div class="flex flex-row w-full text-center items-center mb-8 pl-8 pr-8">
        <img class="ml-40pc max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/cut-of-meat_1f969.png?raw=true" 
        alt="" data-aos="fade-up" data-aos-delay="50"/>  
      </div>
      Staking<br />User Guide
    </a>
    <a 
      style="background-color: #ff4b4a; color: white;"
      target="_blank" href="https://medium.com/piedao/launching-uma-kpi-options-for-dough-staked-ee57ed6a10e7"
      class="flex flex-col w-1/3 justify-center pointer p-8 rounded h-200px m-2">
      <div class="flex flex-row w-full text-center items-center mb-12 pl-8 pr-8">
        <img class="w-full max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/uma-uma-logo_1.svg?raw=true" 
        alt="" data-aos="fade-up" data-aos-delay="50"/>  
      </div>
      Learn about<br />UMA KPI Options
    </a>
    <a
      style="background-color: #5a65ea; color: white;"
      target="_blank" href="hhttps://discord.gg/DpZ2tMt6"
      class="flex flex-col w-1/3 justify-center pointer p-8 rounded h-200px m-2">     
      <div class="flex flex-row w-full text-center items-center mb-8">
        <img class="w-full max-h-80px" src="https://github.com/pie-dao/brand/blob/master/misc/discord_1.svg?raw=true" 
        alt="" data-aos="fade-up" data-aos-delay="50"/>  
      </div>
      Join our<br />Discord
    </a>                
  </div> 

</div>

<div class="flex flex-col items-center text-center mx-8 mt-4">
  <div class="flex flex-col items-center w-full max-w-1100px pb-12 px-0 md:px-10">
    <div class="text-base text-center">
      <p class="my-4">
        If we managed to hit the milestone of over 20% DOUGH staked in under a week by the efforts of a handful of individuals, can you imagine where we can get by coordinated efforts for several-thousand people community? Sky is the limit.
      </p>
      <img class="h-150px inline mb-4" src={images.astronaut} alt="hourglass_rounded" />
    </div> 
    <a 
      target="_blank"
      href="https://twitter.com/share?ref_src=twsrc%5Etfw" 
      class="btnbig mt-4 w-200px text-white rounded-8px p-15px"
      data-url="https://www.piedao.org/#/dough-staking-campaign" 
      data-hashtags="fulltimetokenholder" 
      data-related="PieDAO_DeFi" 
      data-show-count="false">
      Share
    </a>

  </div>
</div>
