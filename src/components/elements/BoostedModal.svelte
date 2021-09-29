<script>
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import Modal from './Modal.svelte';
  import { formatFiat } from '../helpers.js';
  import confetti from '../Confetti.js';
  import { toNum, calculateVeDough, AVG_SECONDS_MONTH } from '../../helpers/staking.js';

  let boostedModal;

  let modalLock = {
    gained: 0,
    oldAmount: 0,
    newAmount: 0,
    animatedAmount: 0,
  };

  const config = {
    angle: 180,
    spread: 360,
    startVelocity: 40,
    elementCount: 40,
    dragFriction: 0.12,
    duration: 8000,
    stagger: 3,
    width: '30px',
    height: '56px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  const button = document.querySelector('#confetti');

  export const showModalLock = (lock) => {
    modalLock.newAmount = Number(formatFiat(toNum(lock.amount), ',', '.', ''));
    modalLock.oldAmount = Number(
      formatFiat(calculateVeDough(lock.amount, lock.lockDuration / AVG_SECONDS_MONTH), ',', '.', ''),
    );
    modalLock.animatedAmount = modalLock.oldAmount;
    modalLock.gained = (modalLock.newAmount / modalLock.oldAmount).toFixed(0);

    confetti(button, config);
    boostedModal.open();

    setTimeout(() => {
      let interval = setInterval(() => {
        if (modalLock.animatedAmount < modalLock.newAmount) {
          modalLock.animatedAmount++;
        } else {
          modalLock.animatedAmount = Number(formatFiat(modalLock.newAmount, ',', '.', ''));
          clearInterval(interval);
        }
      }, 10);
    }, 500);
  };

  const addToken = () => {
    ethereum.sendAsync(
      {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: smartcontracts.reward,
            symbol: 'SLICE',
            decimals: 18,
            image: images.rewardsPie,
          },
        },
        id: Math.round(Math.random() * 100000),
      },
      (err, added) => {
        if (added) {
          displayNotification({
            message: 'The SLICE token has been added to your Metamask!',
            type: 'success',
          });
        } else {
          displayNotification({
            message: 'Sorry, something went wrong. Please try again later.',
            type: 'error',
          });
        }
      },
    );
  };  
</script>

<div id="confetti" class="hidden md:block" />

<Modal title={`You gained ${modalLock.gained}X`} backgroundColor="white" bind:this={boostedModal}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p class="pb-2 font-24px">more rewards and voting power!</p>

    <div class="flex mt-4 mb-6 mx-12 rounded-20px bg-lightgrey p-16px">
      <div class="w-1/2 text-right font-bold font-24px mr-1">
        {modalLock.animatedAmount.toFixed(2)}
      </div>
      <div class="w-1/2 text-left font-24px ml-1">veDOUGH</div>
    </div>

    <div class="text-center mx-auto">
      <img class="w-80px h-80px mx-auto" src={images.rewardsPie} alt="ETH" />
    </div>
    <p class="pt-2 font-24px font-bold">what's next?</p>
    <p class="pt-2 font-24px">
      Add SLICE to your Metamask<br />browser plugin so you will see it<br />among your assets.
    </p>
    <button
      on:click={() => addToken()}
      class="text-center pointer mx-auto object-bottom my-8 font-thin"
    >
      🦊 Add SLICE to MetaMask
    </button>
  </div>
</Modal>
