<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import { onDestroy } from 'svelte';
  import {
    initialize,
    dataObj,
    observable
  } from '../helpers/staking.js';
  import { currentRoute } from "../stores/routes.js";
  import StakingRewardActivity from '../components/StakingRewardActivity.svelte';
  import StakingRewardGovernance from '../components/StakingRewardGovernance.svelte';
  import StakingRewardRevenues from '../components/StakingRewardRevenues.svelte';

  console.log("PARAMS", $currentRoute.params.block);
  $: isLoading = false;
  $: data = dataObj;

  let observer = null;
  let currentAddress = null;

  onDestroy(() => {
    if(observer) {
      observer.unsubscribe();
    }
  });

  $: if ($eth.address) {
    // if address is first setup, or is changed...
    if (currentAddress !== $eth.address) {
      currentAddress = $eth.address;

      if (!isLoading) {
        isLoading = true;

        initialize($eth).then((updated_data) => {
          data = updated_data;
          isLoading = false;

          if(observer) {
            observer.unsubscribe();      
          }          

          observer = observable.subscribe({
            next(updated_data) {
              data = updated_data;
            }
          });     
        }).catch(error => {
          console.error(error);
        });        
      }
    }
  } else {
    if(observer) {
      observer.unsubscribe();      
    }
  }
</script>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <StakingRewardActivity /> 
    <StakingRewardGovernance accountVeTokenBalance={data.accountVeTokenBalance} /> 
    <StakingRewardRevenues /> 
  </div>
</div>
