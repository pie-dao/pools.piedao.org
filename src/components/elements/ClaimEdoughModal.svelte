<script>
  import images from '../../config/images.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../helpers.js';
  import { toNum } from '../../helpers/staking.js';
  import { subject } from '../../stores/eth.js';
  import displayNotification from '../../notifications.js';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let rewardEscrowContract;

  let claimModalTitle = 'Claim DOUGH';
  let buttonText = 'Claim DOUGH';
  let claimModal;
  let isClaiming = false;
  let _dough = null;

  export const showModal = (dough) => {
    _dough = dough;
    claimModal.open();
  };

  async function claimDough() {
  isClaiming = true;
    buttonText = 'Claiming';

    let interval = setInterval(() => {
      let occurrences = buttonText.split('.').length - 1;

      if (occurrences < 3) {
        buttonText += '.';
      } else {
        buttonText = 'Claiming';
      }
    }, 1000);

    try {
      const { emitter } = displayNotification(
        await rewardEscrowContract.vest()
      );

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'You claimed DOUGH',
              type: 'success',
            });

            subscription.unsubscribe();
            
            isClaiming = false;
            buttonText = 'Claim DOUGH';
            clearInterval(interval);

            dispatch('claimed', {});
          },
        });
      });      
    } catch(error) {
      console.error(error);

      isClaiming = false;
      buttonText = 'Claim DOUGH';
      clearInterval(interval);
      
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });      
    }    


  }
</script>

<Modal title={claimModalTitle} backgroundColor="#f3f3f3" bind:this={claimModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p>You are awesome! ✨</p>
    <p class="pb-2">Thank you for being a valuable liquidity provider for pies. 🤝</p>

    <div class="text-center mx-auto">
      <img class="w-80px h-80px mx-auto" src={images.doughtoken} alt="DOUGH" />
    </div>
    <p class="pt-2 font-24px">
      <b>
        {formatFiat(toNum(_dough), ',', '.', '')} DOUGH
      </b>
    </p>

    <button
      disabled={isClaiming}
      on:click={() => {
        claimDough();
      }}
      class="mt-4 pointer flex items-center stakinggradient"
      style="border-radius: 15px !important;"
    >
      {#if buttonText == 'Claimed'}
        <svg
          width="20"
          class="ml-4 mr-2"
          height="14"
          viewBox="0 0 19 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.0854 0.00229427C16.6112 0.0278993 16.1653 0.243858 15.8425 0.604302L7.51826 9.5518L2.9798 5.72727C2.60327 5.41108 2.12082 5.26268 1.6386 5.31471C1.15637 5.36673 0.713854 5.61493 0.408406 6.00469C0.102958 6.39446 -0.0404053 6.89387 0.00985482 7.39305C0.0601149 7.89224 0.299881 8.35032 0.676408 8.66651L6.51479 13.577C6.86936 13.8753 7.31912 14.025 7.77518 13.9966C8.23124 13.9682 8.66041 13.7637 8.97785 13.4235L18.4652 3.22481C18.7259 2.95508 18.9016 2.60995 18.9691 2.23486C19.0366 1.85976 18.9928 1.47228 18.8435 1.12345C18.6941 0.774628 18.4462 0.480813 18.1324 0.280682C17.8186 0.0805498 17.4536 -0.0165027 17.0854 0.00229427V0.00229427Z"
            fill="black"
          />
        </svg>
        <div class="flex items-center pr-6 pt-3 pb-3">
          {buttonText}
        </div>
      {:else}
        <div class="flex items-center pl-6 pr-6 pt-3 pb-3">
          {buttonText}
        </div>
      {/if}
    </button>
  </div>
</Modal>
