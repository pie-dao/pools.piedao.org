<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../components/helpers.js';
  import { toNum, claim , getParticipations} from '../helpers/staking.js';
  import images from '../config/images.json';
  import Modal from '../components/elements/Modal.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data;
  export let eth;

  let participations = getParticipations();
  let staker = {participation: 0};
  let modalinfo;

  $: if (eth.address) {
    let founded = participations.find(staker => staker.address.toLowerCase() == eth.address.toLowerCase());
    staker = founded ? founded : staker;
  }
</script>

<Modal title="You can't claim yet" backgroundColor="#f3f3f3" bind:this={modalinfo}>
  <div slot="content" class="font-thin text-center">
    <p class="pb-2">Here's what you have to do:</p>
    <div class="text-center mx-auto">
      <img
      class="w-80px h-80px mx-auto"
      src={images.rewardsPie}
      alt="ETH"
    /> 
    </div>
    <p class="pt-2">1. Vote on the current proposal<br />to be eligible to claim rewards</p>
    <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
      <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
    </div>    
    <p class="pt-2">2. At the end of the months rewards will<br />be recalculated  and you will able to claim those</p>
    <div class="text-center mx-auto">
      <img
      class="w-100px h-100px mx-auto p-4 token-icon "
      src={images.simulator_sword}
      alt="ETH"
    /> 
    </div>    
    <p class="pt-2 pb-2">3. Remember, rewards unclaimed for 3 months<br />are going  to be slashed and redestributed to active participants</p>
  </div>
</Modal>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Total staked DOUGH</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        <div class="font-24px">{eth.address ? formatFiat(toNum(data.totalStaked), ',', '.', '') : 0}</div>
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
          {eth.address ? formatFiat(toNum(data.accountVeTokenBalance), ',', '.', '') : 0}
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
      <div class="flex nowrap intems-center p-1 font-thin">Rewards</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <div class="flex-1">
        <span class="sc-iybRtq gjVeBU">
          <div class="font-24px">
            {eth.address ? formatFiat(toNum(data.accountWithdrawableRewards), ',', '.', '') : 0}
          </div>
          <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">RWRD</span>
        </span>        
      </div>
      {#if eth.address}
      <button 
      class="flex items-center bg-black rounded-xl -mr-2 pointer px-4 py-2 text-white"
      on:click={() => {
        if(!data.accountWithdrawableRewards.eq(0) && staker.participation == 1) {
          claim(eth).then(updated_data => {
          data = updated_data;
          data = data;

          dispatch('update', {
            data: data,
          });          
        }).catch(error => {
          console.error(error);
        });
        } else {
          modalinfo.open()
        }
      }}
      > Claim</button>
    {/if}
    </div>
  </div>
</div>