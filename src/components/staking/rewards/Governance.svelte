<script>
  import { eth } from '../../../stores/eth.js';
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum, AVG_SECONDS_MONTH} from '../../../helpers/staking.js';
  import images from '../../../config/images.json';
  import epochsJSON from '../../../config/epochs.json';

  export let timestamp;
  let currentAddress;
  let report;
  let currentAccount;
  let totalVeDoughVoted;
  let participationRatio;

  $: if ($eth.address) {
    // if address is first setup, or is changed...
    if (currentAddress !== $eth.address) {
      currentAddress = $eth.address;

      // TODO: this should be changed, fetch the epochs from backend
      report = epochsJSON.epochs.find(epoch => epoch.startDate <= timestamp && epoch.endDate >= timestamp);
      currentAccount = report.merkleTree.leafs.find(leaf => leaf.staker.id == $eth.address);
      
      totalVeDoughVoted = report.participants.reduce((previousValue, currentValue) => {
        return {score: previousValue.score + currentValue.score};
      });

      participationRatio = ((totalVeDoughVoted.score * 100) / toNum(report.stakingStats.veTokenTotalSupply)).toFixed(2);
    }
  }
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-left pb-4">Governance</div>
    {#if $eth.address}
      {#if currentAccount}
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <img class="h-auto w-24px mr-10px" src={images.veDough} alt="dough token" />
            <span class="token-symbol-container">Total veDOUGH</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {formatFiat(toNum(report.stakingStats.veTokenTotalSupply), ',', '.', '')}
            </div>        
          </div>
        </div>

        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <span class="token-symbol-container">Avg Lock Time</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {Math.floor(report.stakingStats.averageTimeLock / AVG_SECONDS_MONTH)}
            </div>        
          </div>
        </div>  
        
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <span class="token-symbol-container">N of proposals this months</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {report.proposals.length}
            </div>        
          </div>
        </div>  
        
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <span class="token-symbol-container">Participation Ration</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {participationRatio}%
            </div>        
          </div>
        </div>  
        
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <span class="token-symbol-container">Total veDOUGH Voted</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {formatFiat(totalVeDoughVoted.score, ',', '.', '')}
            </div>        
          </div>
        </div>         
      {:else}   
        <div class="text-center p-1">
          Sorry, there's no data for this account.
        </div> 
      {/if}
    {:else}
    <div class="text-center p-1">
      loading...
    </div> 
    {/if}
  </div>
</div>