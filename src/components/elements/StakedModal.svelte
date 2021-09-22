<script>
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import Modal from './Modal.svelte';
  import confetti from '../Confetti.js';
  import { parseEther } from '@ethersproject/units';
  import { calculateVeDough } from '../../helpers/staking.js';

  let stakedModal;

  let modalStake = {
    amount: 0,
    animatedAmount: 0,
    move: 'first_move',
    text: 'maxDuration_hasDough'
  };

  let messages = {
    first_move: {
      title: 'Nice first move!'    
    },
    second_move: {
      title: 'Congrats!'
    },
    text: {
      maxDuration_hasDough: 'Try to maximise your profit<br />by staking more DOUGH',
      maxDuration_noDough: 'Legend! You went full in<br />and will have our respect forever',
      smallDuration_hasDough: 'Try to maximise your staking<br />by boosting it to 3 years',
      smallDuration_noDough: 'Try to maximise your staking<br />by boosting it to 3 years'
    }    
  }

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

  export const showModal = (stakeAmount, stakeDuration, data) => {
    modalStake.move = data.accountLocks.length == 1 ? "first_move" : "second_move";

    if(stakeDuration == 36 && data.accountDepositTokenBalance.eq(0)) {
      modalStake.text = "maxDuration_noDough";
    }

    if(stakeDuration == 36 && !data.accountDepositTokenBalance.eq(0)) {
      modalStake.text = "maxDuration_hasDough";
    }    

    if(stakeDuration < 36 && !data.accountDepositTokenBalance.eq(0)) {
      modalStake.text = "smallDuration_noDough";
    }  

    if(stakeDuration < 36 && !data.accountDepositTokenBalance.eq(0)) {
      modalStake.text = "smallDuration_hasDough";
    }    
    
    let veDOUGH = calculateVeDough(parseEther(stakeAmount.toString()), stakeDuration);
    modalStake.amount = Number(veDOUGH);
    modalStake.animatedAmount = 0;

    confetti(button, config);
    stakedModal.open();

    setTimeout(() => {
      let interval = setInterval(() => {
        if (modalStake.animatedAmount < modalStake.amount) {
          modalStake.animatedAmount++;
        } else {
          modalStake.animatedAmount = modalStake.amount;
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
            address: smartcontracts.veDOUGH,
            symbol: 'veDOUGH',
            decimals: 18,
            image: images.simulator_veDough,
          },
        },
        id: Math.round(Math.random() * 100000),
      },
      (err, added) => {
        if (added) {
          displayNotification({
            message: 'The veDOUGH token has been added to your Metamask!',
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

<Modal title={messages[modalStake.move].title} backgroundColor="white" bind:this={stakedModal}>
  <div slot="content" class="font-thin text-center">
    <p class="pb-2 font-24px">You just staked</p>

    <div class="flex mt-4 mb-6 mx-12 rounded-20px bg-lightgrey p-16px">
      <div class="w-1/2 text-right font-bold font-24px mr-1">
        {modalStake.animatedAmount.toFixed(2)}
      </div>
      <div class="w-1/2 text-left font-24px ml-1">veDOUGH</div>
    </div>

    <div class="text-center mx-auto">
      <img class="w-120px h-120px mx-auto" src={images.voting_hands} alt="ETH" />
    </div>
    <p class="pt-2 font-24px font-bold">what's next?</p>

    <p class="pt-2 font-22px">1. Vote on the current proposals<br />to be eligible to claim rewards</p>
    <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
      <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
    </div>

    <p class="pt-2 font-22px">2. {@html messages.text[modalStake.text]}</p>
    <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 mb-4 w-200px" style="border: 1px solid #FFAC32;">
      {#if modalStake.text == 'maxDuration_hasDough'}
        <button
        on:click={() => stakedModal.close()}
        >Stake more DOUGH</button>
      {:else}
        {#if modalStake.text == 'maxDuration_noDough'}
          <button>Claim SLICE</button>
        {:else}
        <button>Restake 3 years</button>
        {/if}
      {/if}
    </div>    

    <p class="pt-2 font-22px">
      3. Add veDOUGH to your Metamask<br />browser plugin so you will see it<br />among your assets.
    </p>
    <button
      on:click={() => addToken()}
      class="text-center pointer mx-auto object-bottom my-8 font-thin"
    >
      🦊 Add veDOUGH to MetaMask
    </button>
  </div>
</Modal>
