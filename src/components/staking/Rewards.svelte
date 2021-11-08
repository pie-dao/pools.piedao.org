<script>
  import { _ } from 'svelte-i18n';
  import images from '../../config/images.json';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum } from '../../helpers/staking.js';
  import { etherscanUrl } from '../../stores/eth/connection.js';
  import Modal from '../../components/elements/Modal.svelte';
  let modalinfo;

  export let isLoading;
  export let data;
  export let eth;
  export let itemsNumber = data.rewards.length;
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

{#if eth.address}
<div class="flex flex-col items-center w-full pb-6 bg-lightyellow rounded-16 mt-6">
  <div class="font-huge text-center mt-6">Claimed Rewards</div>
  {#if isLoading}
    Loading...
  {:else}        
    {#if data.rewards && data.rewards.length > 0}
      {#each data.rewards.slice(0, itemsNumber) as reward}
        {#if reward.type != 'distributed'}
          <a
            href={"#/staking_reward_breakdown/" + reward.timestamp * 1000}
            target="_blank"
            class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px"
          >
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">
                {new Date(reward.timestamp * 1000).toDateString()}
              </div>
              <a class="" href="{etherscanUrl}/tx/{reward.id}" target="_blank"
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
              <div 
              on:click={() => {
                reward.type == 'slashed' ? modalinfo.open() : null;
              }}
              class="flex items-center justify-between">
                <img
                  class="h-auto w-24px mx-5px"
                  src={reward.type == 'claimed' ? images.claimed : images.slashed}
                  alt="clamed icon"
                />
                <span>{reward.type}</span>
              </div>
            </div>
          </a>
        {/if}
      {/each}
    {:else}
    <span class="text-s text-center mx-8">you haven't claimed any reward yet.</span>
    {/if}
  {/if}

  {#if data.rewards.length > itemsNumber}
  <a class="pt-6" href="#/staking_rewards"> See all rewards </a>
{/if}
</div>
{/if}