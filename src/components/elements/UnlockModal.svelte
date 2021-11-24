<script>
  import images from '../../config/images.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../helpers.js';
  import { calculateStakingEnds } from '../../helpers/staking.js';
  import moment from 'moment';

  let bindedModal;
  let UnlockModalStatus = {
    isOpen: false,
    lock: null,
    withdrawnRewards: null,
    countdown: null
  };

  export const showModalUnock = (lock, accountWithdrawnRewards) => {
    console.log("showModalUnock", UnlockModalStatus, lock, accountWithdrawnRewards);
    UnlockModalStatus.withdrawnRewards = accountWithdrawnRewards;
    UnlockModalStatus.lock = lock;

    let lockEndDate = moment(calculateStakingEnds(UnlockModalStatus.lock));
    let currentDate = moment(new Date());

    let diffDuration = moment.duration(lockEndDate.diff(currentDate));
    UnlockModalStatus.countdown = `<b>${diffDuration.years()}</b>y:<b>${diffDuration.months()}</b>m:<b>${diffDuration.days()}</b>d:<b>${diffDuration.hours()}</b>h`;      

    bindedModal.open();
  };
 
</script>

<Modal title="You can't unstake yet" backgroundColor="white" bind:this={bindedModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p class="pb-2 font-24px">your locking period expires in</p>
    <p class="pb-2 text-xl">{@html UnlockModalStatus.countdown}</p>

    <div class="text-center mx-auto">
      <img class="w-80px h-80px mx-auto" src={images.rewardsPie} alt="ETH" />
    </div>
    <p class="pt-2 font-24px font-bold">{formatFiat(UnlockModalStatus.withdrawnRewards, ',', '.', '')} SLICE</p>
    <p class="pt-2 font-24px">
      Rewards claimed to date
    </p>
  </div>
</Modal>
