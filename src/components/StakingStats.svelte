<script>
  import { _ } from 'svelte-i18n';
  import { eth } from '../stores/eth.js';
  import { formatFiat, formatBigMoneyAmount } from '../components/helpers.js';
  import { toNum, fetchStakingStats } from '../helpers/staking.js';
  import images from '../config/images.json';
  import ProgressBar from '@okrad/svelte-progressbar';

  let stakedPercent = 0;
  let quorumPercent = 0;
  let formattedTotalDough = 0;

  $: stakingStats = {
      isLoading: true,
      totalHolders: 0,
      averageLockDUration: 0,
      totalStakedDough: 0,
      totalVeDough: 0,
      totalDough: 0
    }

  $: if($eth.signer && $eth.provider && stakingStats.isLoading) {
    stakingStats.isLoading = false;

    fetchStakingStats($eth).then(response => {
        stakingStats = response;
        console.log("fetchStakingStats", stakingStats);

        formattedTotalDough = formatBigMoneyAmount(toNum(stakingStats.totalDough), ',', '');
        //let stakedPercent = ((toNum(stakingStats.totalStakedDough) * 100) / toNum(stakingStats.totalDough)).toFixed(2);
        stakedPercent = 25;
        quorumPercent = 100;        
      }).catch(error => {
        console.error(error);
      });  
  }
</script>

<div
  class="w-full flex flex-col lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px p-6"
>
  <div class="w-full flex flex-col w-full p-1px rounded-16" style="background-color: #e1f4f2;">
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU m-4">
        <img class="h-auto w-24px" src={images.cut_of_meat} alt="dough token" />
        <div class="flex nowrap intems-center p-1 font-24px">Key Staking Stats</div>
      </span>
    </div>
    <!-- TOTAL STAKED DOUGH -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU mr-4">
          <img class="h-auto w-24px" src={images.doughtoken} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Total staked DOUGH</div>
          <div class="font-24px">
            {formatFiat(toNum(stakingStats.totalStakedDough), ',', '.', '')} DOUGH
          </div>
        </span>
        <ProgressBar
        series={[stakedPercent, 100 - stakedPercent]} 
        valueLabel={` ${stakedPercent}% of ${formattedTotalDough} Tot circulating DOUGH`}
        width='350'
        height='30'
        textSize='100'
        rx='10'
        ry='10'
        thresholds={[
          {
            till: stakedPercent,
            color: '#38fe61'
          },          
          {
            till: 100,
            color: '#dbffdd'
          }          
        ]}
      />    
      </div>
    </div>
    <!-- Average Time Lock -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU ">
          <img class="h-auto w-24px" src={images.locked_with_key} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Average Time Lock</div>
          <div class="font-24px">{stakingStats.averageLockDUration} Months</div>
        </span>    
      </div>
    </div>
    <!-- TOTAL veDOUGH -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU mr-4">
          <img class="h-auto w-24px" src={images.veDough} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Total veDOUGH</div>
          <div class="font-24px">
            {formatFiat(toNum(stakingStats.totalVeDough), ',', '.', '')} veDOUGH
          </div>
        </span>
        <ProgressBar
          series={quorumPercent} 
          valueLabel={`5% Quorum = ${formatFiat((toNum(stakingStats.totalVeDough) * 5) / 100, ',', '.', '')} veDOUGH`}
          width='350'
          height='30'
          textSize='100'
          rx='10'
          ry='10'
          thresholds={[
            {
              till: 100,
              color: '#fde502'
            }
          ]}
        />
      </div>
    </div>
    <!-- Voting Addresses -->
    <div class="flex flex-col nowrap w-92pc m-4 swap-from rounded-20px bg-white p-16px">
      <div class="flex nowrap items-center p-1">
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px" src={images.person_raising_hand} alt="dough token" />
          <div class="flex nowrap intems-center p-1 font-thin">Voting Addresses</div>
          <div class="font-24px">{stakingStats.totalHolders}</div>
        </span>
      </div>
    </div>
  </div>
</div>
