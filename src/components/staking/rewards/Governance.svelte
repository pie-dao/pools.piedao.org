<script>
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum, AVG_SECONDS_MONTH} from '../../../helpers/staking.js';
  import images from '../../../config/images.json';
  import epochsJSON from '../../../config/epochs.json';

  export let timestamp;
  let report;
  let totalVeDoughVoted;
  let participationRatio;

  // TODO: this should be changed, fetch the epochs from backend
  report = epochsJSON.epochs.find(epoch => epoch.startDate <= timestamp && epoch.endDate >= timestamp);
  
  totalVeDoughVoted = report.participants.reduce((previousValue, currentValue) => {
    return {score: previousValue.score + currentValue.score};
  });

  participationRatio = ((totalVeDoughVoted.score * 100) / toNum(report.stakingStats.veTokenTotalSupply)).toFixed(2);
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-left pb-4">Governance</div>
    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <img class="h-auto w-24px mr-10px" src={images.veDough} alt="dough token" />
        <span class="token-symbol-container font-thin">Total veDOUGH</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {formatFiat(toNum(report.stakingStats.veTokenTotalSupply), ',', '.', '')}
        </div>        
      </div>
    </div>

    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">Avg Lock Time</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {Math.floor(report.stakingStats.averageTimeLock / AVG_SECONDS_MONTH)}
        </div>        
      </div>
    </div>  
    
    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">N° of proposals this month</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {report.proposals.length}
        </div>        
      </div>
    </div>  
    
    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">Participation Ratio</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {participationRatio}%
        </div>        
      </div>
    </div>  
    
    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">Total veDOUGH Voted</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {formatFiat(totalVeDoughVoted.score, ',', '.', '')}
        </div>        
      </div>
    </div> 
  </div>
</div>