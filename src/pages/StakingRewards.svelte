<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import { initialize, dataObj } from '../helpers/staking.js';
  import StakingRewards from '../components/StakingRewards.svelte';

  $: isLoading = true;
  $: hasLoaded = false;
  $: data = dataObj;

  $: if ($eth.address && isLoading && !hasLoaded) {
    hasLoaded = true;

    initialize($eth).then((updated_data) => {
      data = updated_data;
      isLoading = false;
    }).catch(error => {
      hasLoaded = false;
      console.error(error);
    });
  }
</script>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <a class="pt-6" href="#/new_staking">Go Back</a>
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- PAST REWARDS -->
      {#key data}
        <StakingRewards data={data} isLoading={isLoading}></StakingRewards>
      {/key}
      <!-- END PAST REWARDS -->
    </div>
  </div>
</div>
