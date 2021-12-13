<script>
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum, AVG_SECONDS_MONTH} from '../../../helpers/staking.js';
  import images from '../../../config/images.json';

  export let epoch;
  let participationRatio;
  let totalVeDoughScore = 0;

  epoch.participants.forEach(participant => {
    if(participant.votes.length > 0) {
      let participantScoreTotal = 0;

      participant.votes.forEach(vote => {
        participantScoreTotal += vote.score;
      });

      totalVeDoughScore += participantScoreTotal / participant.votes.length;
    }
  });

  participationRatio = ((totalVeDoughScore * 100) / toNum(epoch.stakingStats.veTokenTotalSupply)).toFixed(2);
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
          {formatFiat(toNum(epoch.stakingStats.veTokenTotalSupply), ',', '.', '')}
        </div>        
      </div>
    </div>

    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">Avg Lock Time</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {Math.floor(epoch.stakingStats.averageTimeLock / AVG_SECONDS_MONTH)}
        </div>        
      </div>
    </div>  
    
    <div class="flex flex-row p-1 justify-between items-center">
      <div class="flex items-center">
        <span class="token-symbol-container font-thin">N° of proposals this month</span>          
      </div>
      <div class="flex flex-col items-right">
        <div class="">
          {epoch.proposals.length}
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
          {formatFiat(totalVeDoughScore, ',', '.', '')}
        </div>        
      </div>
    </div> 
  </div>
</div>