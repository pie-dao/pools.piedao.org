<script>
  import { _ } from 'svelte-i18n';
  import { eth } from '../stores/eth.js';
  import { formatFiat, formatBigMoneyAmount } from '../components/helpers.js';
  import { toNum, fetchStakingStats } from '../helpers/staking.js';
  import { stakingStats } from '../stores/eth/writables';
  import images from '../config/images.json';
  import ProgressBar from '@okrad/svelte-progressbar';
  import ArrowLoadingButton from "./ArrowLoadingButton.svelte";

  export let showLoader = false;
  let stakedPercent = 0;
  let quorumPercent = 100;
  let formattedTotalDough = 0;
  let plotBars = false;
  let isLoading = true;

  $: if($eth.provider && isLoading) {
    isLoading = false;

    fetchStakingStats($eth.provider).then(response => {
        $stakingStats = response;
        console.log("fetchStakingStats", $stakingStats);

        formattedTotalDough = formatBigMoneyAmount(toNum($stakingStats.totalDough), ',', '');
        stakedPercent = ((toNum($stakingStats.totalStakedDough) * 100) / toNum($stakingStats.totalDough));
        quorumPercent = 100; 

        plotBars = true;  
      }).catch(error => {
        console.error(error);
      });  
  }

  function handleLoadingButtonClick() {
    console.log("loading button has been clicked");
  }
</script>

<div
  class="w-full flex flex-col lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px p-6"
>
  <div class="w-full flex flex-col w-full rounded-16 p-6" style="background-color: #e1f4f2;">
    <div class="flex flex-row nowrap w-full items-center">
      <span class=" flex w-11/12">
        <img class="h-auto w-24px" src={images.cut_of_meat} alt="dough token" />
        <div class="flex intems-center p-1 font-20px">Key Staking Stats</div>
      </span>
      {#if showLoader}
        <span class=" flex w-1/12">
          <ArrowLoadingButton on:clicked={handleLoadingButtonClick}/>
        </span>
      {/if}
    </div>
    <div class="flex flex-col lg:flex-row wrap mt-4">
    <!-- TOTAL STAKED DOUGH -->
    <div class="flex rounded-20px bg-white p-16px mr-0 lg:mr-4 mb-4 lg:mb-0">
      <div class="flex items-center p-1">
        <span class=" flex items-center mr-8">
          <img class="h-auto w-24px" src={images.doughtoken} alt="dough token" />
          <div class="flex intems-center p-1 font-thin whitespace-nowrap">Total staked DOUGH</div>
          <div class="font-20px whitespace-nowrap">
            {formatFiat(toNum($stakingStats.totalStakedDough), ',', '.', '')} DOUGH
          </div>
        </span>
        <span class="hidden md:block">
        {#if plotBars}
          <ProgressBar
            series={[stakedPercent.toFixed(0), 100 - stakedPercent.toFixed(0)]} 
            valueLabel={` ${stakedPercent.toFixed(2)}% of ${formattedTotalDough} Tot circulating DOUGH`}
            invLabelColor= true
            width='240'
            height='30'
            textSize='70'
            rx='10'
            ry='10'
            thresholds={[
              {
                till: stakedPercent.toFixed(0),
                color: '#38fe61'
              },          
              {
                till: 100,
                color: '#dbffdd'
              }          
            ]}
          /> 
        {:else}
          <ProgressBar
            series={[0]} 
            valueLabel={'Loading...'}
            invLabelColor= true
            width='240'
            height='30'
            textSize='70'
            rx='10'
            ry='10'
            thresholds={[
              {
                till: stakedPercent.toFixed(0),
                color: '#38fe61'
              },          
              {
                till: 100,
                color: '#dbffdd'
              }          
            ]}
          />          
        {/if}
    </span>  
      </div>
    </div>
    <!-- Average Time Lock -->
    <div class="flex flex-col  rounded-20px bg-white p-16px">
      <div class="flex items-center p-1">
        <span class=" flex items-center ">
          <img class="h-auto w-24px" src={images.locked_with_key} alt="dough token" />
          <div class="flex intems-center p-1 font-thin whitespace-nowrap">Average Time Lock</div>
          <div class="font-20px whitespace-nowrap">{$stakingStats.averageTimeLock} Months</div>
        </span>    
      </div>
    </div>
  </div>
  <div class="flex flex-col lg:flex-row wrap mt-4">
    <!-- TOTAL veDOUGH -->
    <div class="flex flex-col  rounded-20px bg-white p-16px mr-0 lg:mr-4 mb-4 lg:mb-0">
      <div class="flex items-center p-1">
        <span class=" flex items-center mr-4">
          <img class="h-auto w-24px" src={images.veDough} alt="dough token" />
          <div class="flex intems-center p-1 font-thin whitespace-nowrap">Total veDOUGH</div>
          <div class="font-20px whitespace-nowrap">
            {formatFiat(toNum($stakingStats.totalVeDough), ',', '.', '')} veDOUGH
          </div>
        </span>
        <span class="hidden md:block">
        {#if plotBars}
          <ProgressBar
            series={quorumPercent} 
            valueLabel={`5% Quorum = ${formatFiat((toNum($stakingStats.totalVeDough) * 5) / 100, ',', '.', '')} veDOUGH`}
            width='250'
            height='30'
            textSize='70'
            invLabelColor= true
            rx='10'
            ry='10'
            thresholds={[
              {
                till: 100,
                color: '#fde502'        
              }
            ]}
          />
        {:else}
          <ProgressBar
            series={[0]} 
            valueLabel={`Loading...`}
            width='250'
            height='30'
            textSize='70'
            invLabelColor= true
            rx='10'
            ry='10'
            thresholds={[
              {
                till: 100,
                color: '#fde502'        
              }
            ]}
          />        
        {/if}
      </span>
      </div>
    </div>
    <!-- Voting Addresses -->
    <div class="flex flex-col  rounded-20px bg-white p-16px">
      <div class="flex items-center p-1">
        <span class=" flex items-center">
          <img class="h-auto w-24px" src={images.person_raising_hand} alt="dough token" />
          <div class="flex intems-center p-1 font-thin whitespace-nowrap">Voting Addresses</div>
          <div class="font-20px whitespace-nowrap">{$stakingStats.totalHolders}</div>
        </span>
      </div>
    </div>
  </div>

</div>
</div>
