<script>
  import images from '../../config/images.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../helpers.js';
  import { calculateStakingEnds, toNum } from '../../helpers/staking.js';
  import { UnlockModalIsOpen } from '../../stores/eth/writables.js';
  import moment from 'moment';

  let bindedModal;
  let modalLock;
  let withdrawnRewards;
  let countdown;

  export const showModalLock = (lock, accountWithdrawnRewards) => {
    withdrawnRewards = accountWithdrawnRewards;

    let lockEndDate = moment(calculateStakingEnds(lock));
    let currentDate = moment(new Date());

    let diffDuration = moment.duration(lockEndDate.diff(currentDate));
    countdown = `<b>${diffDuration.years()}</b>y:<b>${diffDuration.months()}</b>m:<b>${diffDuration.days()}</b>d:<b>${diffDuration.hours()}</b>h`;

    bindedModal.open();
  };

  const modalChanged = (event) => {
    $UnlockModalIsOpen = event.detail.data.isOpen;
  }
 
</script>

<Modal title="You can't unstake yet" backgroundColor="white" bind:this={bindedModal} modalIsOpen={$UnlockModalIsOpen} on:modalChanged={modalChanged}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p class="pb-2 font-24px">your locking period expires in</p>
    <p class="pb-2 text-xl">{@html countdown}</p>

    <div class="text-center mx-auto">
      <img class="w-80px h-80px mx-auto" src={images.rewardsPie} alt="ETH" />
    </div>
    <p class="pt-2 font-24px font-bold">{formatFiat(withdrawnRewards, ',', '.', '')} SLICE</p>
    <p class="pt-2 font-24px">
      Rewards claimed to date
    </p>
  </div>
</Modal>
