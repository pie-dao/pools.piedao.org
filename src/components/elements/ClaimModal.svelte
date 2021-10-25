<script>
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import Modal from './Modal.svelte';
  import confetti from '../Confetti.js';
  import { parseEther } from '@ethersproject/units';
  import { calculateVeDough, getLastLockForAddress, boostToMax } from '../../helpers/staking.js';
  import BigNumber from 'bignumber.js';
  import Proposals from './Proposals.svelte';

  let _data;
  let claimModal;

  export const showModal = (data) => {
    _data = data;
    claimModal.open();
  };
</script>

<div id="confetti" class="hidden md:block" />

<Modal title="You can't claim yet" backgroundColor="#f3f3f3" bind:this={claimModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p class="pb-2">Here's what you have to do:</p>

    {#if _data.proposals && _data.proposals.length}
      <Proposals proposals={_data.proposals} />
    {:else}
      <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
        <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
      </div>
    {/if}   
    <p class="pt-2 mb-8">1. Vote on the current proposals<br />to be eligible to claim rewards</p>
   
    <div class="text-center mx-auto">
      <img
      class="w-80px h-80px mx-auto"
      src={images.rewardsPie}
      alt="ETH"
    /> 
    </div>    
    <p class="pt-2 mb-4">2. Claim your rewards!<br />Rewards are calculated and available<br />for claiming at the start of every calendar month.</p>

    <div class="text-center mx-auto">
      <img
      class=" mx-auto pt-4 token-icon"
      src={images.simulator_sword}
      alt="ETH"
    /> 
    </div>    
    <p class="pt-2 pb-2">3. Remember, rewards unclaimed for 3 months<br />are going  to be slashed and redestributed to active participants</p>
  </div>
</Modal>
