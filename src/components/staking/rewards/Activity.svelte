<script>
  import { eth } from '../../../stores/eth.js';
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum} from '../../../helpers/staking.js';
  import images from '../../../config/images.json';
  import epochsJSON from '../../../config/epochs.json';

  export let block;
  let currentAddress;
  let report;
  let currentAccount;

  $: if ($eth.address) {
    console.log("currentAddress", currentAddress);
    // if address is first setup, or is changed...
    if (currentAddress !== $eth.address) {
      currentAddress = $eth.address;

      // TODO: this should be changed, fetch the epochs from backend
      report = epochsJSON.epochs.find(epoch => epoch.startBlock == block);
      currentAccount = report.merkleTree.leafs.find(leaf => leaf.staker.id == $eth.address);
      console.log("currentAccount", currentAccount, $eth.address, report);      
    }
  }
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-center">Activity</div>
    {#if $eth.address}
      {#if currentAccount}
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
              to be calculated
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