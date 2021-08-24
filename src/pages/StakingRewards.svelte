<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import { formatFiat } from '../components/helpers.js';
  import { toNum, initialize, dataObj } from '../helpers/staking.js';

  import Modal from '../components/elements/Modal.svelte';
  let modalinfo;

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

<Modal title="Slashed Rewards" backgroundColor="#f3f3f3" bind:this={modalinfo}>
  <span slot="content" class="p-4 font-thin">
    <strong>What's that?</strong><br />
    If you don't partecipate, you're a looser.<br />
    If you're a looser, we'll slash you.<br /><br />

    <strong>why?</strong><br />
    Sorry man.<br />
    This is your own fault.<br />
  </span>
</Modal>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <a class="pt-6" href="#/new_staking">Go Back</a>
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- PAST REWARDS -->
      <div class="flex flex-col items-center w-full pb-6 bg-lightyellow rounded-16 mt-6">
        <div class="font-huge text-center mt-6">Rewards History</div>
        {#if isLoading}
          Loading...
        {:else}        
          {#if data.rewards && data.rewards.length > 0}
            {#each data.rewards as reward, id}
              {#if reward.type != 'distributed'}
                <div
                  on:click={() => {
                    reward.type == 'slashed' ? modalinfo.open() : null;
                  }}
                  class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex nowrap intems-center p-1 font-thin">
                      {new Date(reward.timestamp * 1000).toDateString()}
                    </div>
                    <a class="" href="https://rinkeby.etherscan.io/tx/{reward.id}" target="_blank"
                      ><img
                        width="20px"
                        height="20px"
                        src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg"
                        alt="external link icon"
                      /></a
                    >
                  </div>
                  <div class="flex nowrap items-center justify-between p-1">
                    <span class="sc-iybRtq gjVeBU">
                      <div class="font-24px">{formatFiat(toNum(reward.amount), ',', '.', '')}</div>
                      <img
                        class="h-auto w-24px mx-5px"
                        src={images.rewardsPie}
                        alt="rewardspie token"
                      />
                    </span>
                    <div class="flex items-center justify-between">
                      <img
                        class="h-auto w-24px mx-5px"
                        src={reward.type == 'claimed' ? images.claimed : images.slashed}
                        alt="clamed icon"
                      />
                      <span>{reward.type}</span>
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
          {:else}
            You have no rewards yet.
          {/if}
        {/if}
      </div>
      <!-- END PAST REWARDS -->
    </div>
  </div>
</div>
