<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import { onDestroy } from 'svelte';
  import { initialize, dataObj, observable } from '../helpers/staking.js';
  import StakingRewards from '../components/StakingRewards.svelte';

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
  }
</script>

<div class="font-huge text-center">Dough Staking</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <a class="pt-6" href="#/dough-staking">Go Back</a>
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- PAST REWARDS -->
      {#key data}
        <StakingRewards data={data} isLoading={isLoading} eth={$eth}></StakingRewards>
      {/key}
      <!-- END PAST REWARDS -->
    </div>
  </div>
</div>
