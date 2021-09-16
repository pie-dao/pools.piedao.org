<script>
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import { formatFiat } from '../components/helpers.js';
  import * as animateScroll from 'svelte-scrollto';
  import smartcontracts from '../config/smartcontracts.json';
  import Modal from '../components/elements/Modal.svelte';
  import {
    toNum,
    calculateStakingEnds,
    calculateStakingStarts,
    calculateVeDough,
    boostToMax,
    getLockStatus,
    didLockExpired,
    unstakeDOUGH,
    canRestake
  } from '../helpers/staking.js';
  import { justBoosted, timestampBoosted } from '../stores/eth/writables';
  import confetti from '../components/Confetti.js';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let isLoading;
  export let data;
  export let eth;
  export let scrollToTop;
  export let itemsNumber = data.accountLocks.length; 
  
  let modalinfo;

  let modalLock = {
    gained: 0,
    oldAmount: 0,
    newAmount: 0,
    animatedAmount: 0
  };

  const config = {
    angle: 180,
    spread: 360,
    startVelocity: 40,
    elementCount: 40,
    dragFriction: 0.12,
    duration: 8000,
    stagger: 3,
    width: "30px",
    height: "56px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };

  const button = document.querySelector("#confetti");  

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

  const showModalLock = (lock) => {
    modalLock.newAmount = Number(formatFiat(toNum(lock.amount), ',', '.', ''));
    modalLock.oldAmount = Number(formatFiat(calculateVeDough(lock.amount, lock.lockDuration / 60),',','.',''));
    modalLock.animatedAmount = modalLock.oldAmount;
    modalLock.gained = (modalLock.newAmount / modalLock.oldAmount).toFixed(0);

    confetti(button, config);
    modalinfo.open();

    setTimeout(() => {
      let interval = setInterval(() => {
      if(modalLock.animatedAmount < modalLock.newAmount) {
        modalLock.animatedAmount++;
      } else {
        modalLock.animatedAmount = Number(formatFiat(modalLock.newAmount, ',', '.', ''));
        clearInterval(interval);
      }
    }, 10);      
    }, 500);
  }
</script>

<div id="confetti" class="hidden md:block"></div>

<Modal title={`You gained ${modalLock.gained}X`} backgroundColor="white" bind:this={modalinfo}>
  <div slot="content" class="font-thin text-center">
    <p class="pb-2 font-24px">more rewards and voting power!</p>

    <div class="flex mt-4 mb-6 mx-12 rounded-20px bg-lightgrey p-16px">
      <div class="w-1/2 text-right font-bold font-24px mr-1">{modalLock.animatedAmount.toFixed(2)}</div>
      <div class="w-1/2 text-left font-24px ml-1">veDOUGH</div>
    </div> 

    <div class="text-center mx-auto">
      <img
      class="w-80px h-80px mx-auto"
      src={images.rewardsPie}
      alt="ETH"
    /> 
    </div>
    <p class="pt-2 font-24px font-bold">what's next?</p>
    <p class="pt-2 font-24px">Add SLICE to your Metamask<br />browser plugin so you  will see it<br />among your assets.</p>
    <button on:click={() => addToken()} class="text-center pointer mx-auto object-bottom my-8 font-thin">
      🦊 Add SLICE to MetaMask
    </button>
  </div>
</Modal>

{#if eth.address}
  <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
    <div class="font-huge text-center mt-6">Your Staking</div>

    {#if isLoading}
      Loading...
    {:else if data.accountLocks && data.accountLocks.length > 0}
      {#each data.accountLocks.slice(0, itemsNumber) as lock, id}
        <!-- Let's show just the normal stakes, and the boosted ones. The stakes having a boostedPointer are obsolete stakes, so we won't show them -->
        {#if lock.boostedPointer == ''}
          <div
            class={lock.ejected
              ? 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-1px opacity-60'
              : $justBoosted == lock.lockId
              ? 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-1px opacity-40'
              : $timestampBoosted && $timestampBoosted < lock.lockedAt
              ? 'fade-in-1 flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-1px cardbordergradient'
              : 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-1px'}
          >
            <div class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex intems-center">
                  <div class="font-thin mr-2">Start:</div>
                  <span
                    >{calculateStakingStarts(lock)
                      .toDateString()
                      .replace(/^\S+\s/, '')}</span
                  >
                </div>
                <div class="flex items-center">
                  <div class="font-thin mr-2">End:</div>
                  <span
                    >{calculateStakingEnds(lock)
                      .toDateString()
                      .replace(/^\S+\s/, '')}</span
                  >
                </div>
              </div>
              <div class="flex nowrap items-center p-1 justify-between mt-2">
                <div class="grid grid-flow-col grid-cols-1 grid-rows-2">
                  <div class="gjVeBU">
                    <div class="font-24px">{formatFiat(toNum(lock.amount), ',', '.', '')}</div>
                    <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                    <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
                  </div>
                  <div class="gjVeBU float-left">
                    <div class="font-24px">
                      {formatFiat(
                        calculateVeDough(lock.amount, lock.lockDuration / 60),
                        ',',
                        '.',
                        '',
                      )}
                    </div>
                    <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                    <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
                  </div>
                </div>
                {#if !lock.boosted || (lock.boosted && canRestake(lock.lockedAt))}
                  {#if !lock.ejected && !lock.withdrawn}
                    <button
                      disabled={lock.lockId == $justBoosted}
                      on:click={() => {
                        showModalLock(lock);

                        // marking the lock as justBoosted...
                        $justBoosted = lock.lockId;
                        // saving the timestampBoosted for further uses...
                        $timestampBoosted = Math.floor(Number(Date.now()) / 1000);

                        // boostToMax(lock.lockId, eth)
                        //   .then((updated_data) => {
                        //     if(scrollToTop) {
                        //       animateScroll.scrollToTop();
                        //     }

                        //     showModalLock(lock);

                        //     // updating the data object...
                        //     data = updated_data;
                        //     data = data;

                        //     setTimeout(() => {
                        //       $timestampBoosted = null;
                        //       $justBoosted = null;
                        //     }, 15000);
                        //   })
                        //   .catch((error) => {
                        //     $justBoosted = null;
                        //     $timestampBoosted = null;
                        //     console.error(error);
                        //   });
                      }}
                      class="flex items-center cardbordergradient -mr-2 pointer"
                    >
                      <div class="flex items-center p-2">
                        {#if $justBoosted == lock.lockId}
                          <div class="mr-8px">Loading...</div>
                        {:else}
                          <div class="mr-8px">Restake 3 years</div>
                        {/if}
                        <img
                          class="w-30px h-30px"
                          src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                          alt="ETH"
                        />
                      </div>
                    </button>
                  {/if}
                {:else}
                  <div class="flex items-center cardbordergradient -mr-2 opacity-30">
                    <div class="flex items-center p-2">
                      <div class="mr-8px">Restake 3 years</div>
                      <img
                        class="w-30px h-30px"
                        src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                        alt="ETH"
                      />
                    </div>
                  </div>
                {/if}
              </div>
              <div class="flex items-center justify-between">
                <div class="flex intems-center">
                  <div class="mt-2 flex justify-start opacity-30 pointer">
                    <span>{getLockStatus(lock)}</span>
                  </div>
                </div>
                <div class="flex items-center">
                  {#if !lock.withdrawn && !lock.ejected}
                    {#if didLockExpired(lock)}
                      <div
                        on:click={() => {
                          console.log('unstakeDOUGH', lock.lockId);
                          unstakeDOUGH(lock.lockId, toNum(lock.amount), eth)
                            .then((updated_data) => {
                              data = updated_data;
                              data = data;

                              dispatch('update', {
                                data: data,
                              });
                            })
                            .catch((error) => {
                              console.error(error.message);
                            });
                        }}
                        class="mt-2 flex justify-end pointer"
                      >
                        <span>Unstake</span>
                      </div>
                    {:else}
                      <div class="mt-2 flex justify-end opacity-30 pointer">
                        <span>Unstake</span>
                      </div>
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    {:else}
      You haven't staked anything yet, what are you waiting for?
    {/if}

    {#if data.accountLocks.length > itemsNumber}
      <a class="pt-6" href="#/staking_positions"> See all staking positions </a>
    {/if}
  </div>
{/if}
