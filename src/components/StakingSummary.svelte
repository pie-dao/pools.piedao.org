<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../components/helpers.js';
  import { toNum, claim } from '../helpers/staking.js';
  import images from '../config/images.json';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data;
  export let eth;
</script>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Total staked DOUGH</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        <div class="font-24px">{formatFiat(toNum(data.totalStaked), ',', '.', '')}</div>
        <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
        <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
      </span>
    </div>
  </div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Your veDOUGH</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        <div class="font-24px">
          {formatFiat(toNum(data.accountVeTokenBalance), ',', '.', '')}
        </div>
        <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
        <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
      </span>
    </div>
  </div>
  <div
    class="flex flex-col nowrap w-92pc mx-4pc mt-4 mb-6 swap-from rounded-20px bg-white p-16px"
  >
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Claimable Rewards</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        <div class="font-24px">
          {formatFiat(toNum(data.accountWithdrawableRewards), ',', '.', '')}
        </div>
        <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
        <span class="sc-kXeGPI jeVIZw token-symbol-container">RWRD</span>
      </span>
    </div>
    {#if !data.accountWithdrawableRewards.eq(0)}
      <button 
      class="pointer" 
      on:click={() => {
        claim(eth).then(updated_data => {
          data = updated_data;
          data = data;

          dispatch('update', {
            data: data,
          });          
        }).catch(error => {
          console.error(error);
        });
      }}
      > Claim now</button>
    {/if}
  </div>
</div>