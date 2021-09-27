<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import { onDestroy } from 'svelte';
  import {
    initialize,
    dataObj,
    observable
  } from '../helpers/staking.js';
  import StakingPositions from '../components/StakingPositions.svelte';

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

	function handleUpdate(event) {
		data = event.detail.data;
    data = data;
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
      <!-- YOUR STAKING -->
      {#key data}
        <StakingPositions data={data} isLoading={isLoading} eth={$eth} on:update={handleUpdate} scrollToTop={true}></StakingPositions>
      {/key}  
      <!-- END YOUR STAKING -->
    </div>
  </div>
</div>
