<script>
  import { eth } from '../../../stores/eth.js';
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum} from '../../../helpers/staking.js';
  import images from '../../../config/images.json';
  import epochsJSON from '../../../config/epochs.json';
  import BigNumber from 'bignumber.js';

  export let timestamp;
  let currentAddress;
  let report;
  let currentAccount;
  let votingPower;

  $: if ($eth.address) {
    // if address is first setup, or is changed...
    if (currentAddress !== $eth.address) {
      currentAddress = $eth.address;

      // TODO: this should be changed, fetch the epochs from backend
      report = epochsJSON.epochs.find(epoch => epoch.startDate <= timestamp && epoch.endDate >= timestamp);
      currentAccount = report.merkleTree.leafs.find(leaf => leaf.staker.id == $eth.address);
      currentAccount.participant = report.participants.find(participant => participant.address == $eth.address);
      
      let accountVeTokenBalance = new BigNumber(currentAccount.staker.accountVeTokenBalance);
      let veTokenTotalSupply = new BigNumber(report.stakingStats.veTokenTotalSupply);
      
      votingPower = ((accountVeTokenBalance.times(100)).div(veTokenTotalSupply)).toFixed(2);
    }
  }
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-left">Your Activity</div>
    {#if $eth.address}
      {#if currentAccount}
        <div class="text-l text-left pt-4">Slice Breakdown</div>
        {#each report.slice.underlying as underlying}
          <div class="flex flex-row p-1 justify-between items-center">
            <div class="flex items-center">
              <img class="h-auto w-24px mr-10px" src={images.logos[underlying.address]} alt={underlying.symbol} />
              <span class="token-symbol-container">{underlying.symbol}</span>          
            </div>
            <div class="flex flex-col items-right">
              <div class="font-24px">
                {underlying.amount}
              </div>        
            </div>
          </div>
        {/each}

        <div class="text-l text-left pt-4">Your Participation</div>
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <img class="h-auto w-24px mr-10px" src={images.veDough} alt="dough token" />
            <span class="token-symbol-container">Your veDOUGH</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {formatFiat(toNum(currentAccount.staker.accountVeTokenBalance), ',', '.', '')}
            </div>        
          </div>
        </div>

        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            <span class="token-symbol-container">Voting Power</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="font-24px">
              {Number(votingPower)}%
            </div>        
          </div>
        </div>  
        
        {#each report.proposals as proposal}
          <div class="flex flex-row p-1 justify-between items-center">
            <div class="flex items-center">
              <span class="token-symbol-container">{proposal.title}</span>          
            </div>
            <div class="flex flex-col items-right">
              <div class="font-24px">
                {#if currentAccount.participant.votes.find(vote => vote.proposal == proposal.id)}
                  Voted
                {:else}
                  N/A
                {/if}
              </div>        
            </div>
          </div>
        {/each}
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