<script>
  import { _ } from 'svelte-i18n';
  import images from '../../config/images.json';
  import { formatFiat } from '../helpers.js';
  import * as animateScroll from 'svelte-scrollto';
  import UnlockModal from '../elements/UnlockModal.svelte';
  import {
    toNum,
    calculateStakingEnds,
    calculateStakingStarts,
    calculateVeDough,
    getLockStatus,
    getLocks,
    unstakeDOUGH,
    AVG_SECONDS_MONTH,
  } from '../../helpers/staking.js';
  import { eth } from '../../stores/eth.js';

  export let scrollToTop;
  export let itemsNumber;

  let isLoading = true;
  let unlockModal;
  let isEmergencyUnlock = true;

  let userLocksLoaded = false;
  $: userLocks = [];

  $: (async () => {
    if ($eth.address && userLocksLoaded == false) {
      console.log('$eth.address', $eth.address)
      userLocks = await getLocks($eth)
      userLocksLoaded = true;
    }
    isLoading = false;
  })()


</script>

<UnlockModal bind:this={unlockModal} />

{#if $eth.address}
  <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
    <div class="font-huge text-center mt-6">Your Locks</div>

    {#if userLocks && userLocks.length > 0}
      {#each userLocks.slice(0, userLocks.length) as lock, id}
        <!-- Let's show just the normal stakes, and the boosted ones. The stakes having a boostedPointer are obsolete stakes, so we won't show them -->
          <div class={'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-1px'} >
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

              <div class="flow-root md:flex nowrap items-center p-1 justify-between mt-2">
                <div class="grid grid-flow-col grid-cols-1 grid-rows-2">
                  <div class="gjVeBU">
                    <div class="font-24px">{formatFiat(toNum(lock.amount), ',', '.', '')}</div>
                    <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                    <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
                  </div>
                  <div class="gjVeBU float-left">
                    <div class="font-24px">
                      {formatFiat(
                        calculateVeDough(lock.amount, lock.lockDuration / AVG_SECONDS_MONTH),
                        ',',
                        '.',
                        '',
                      )}
                    </div>
                    <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                    <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex intems-center">
                  <div class="mt-2 flex justify-start opacity-30 pointer">
                    <span>{getLockStatus(lock)}</span>
                  </div>
                </div>
                <div class="flex items-center">
                      <div
                        on:click={() => {
                          console.log('data', lock, id)
                          unstakeDOUGH(id, toNum(lock.amount), $eth)
                            .then((updated_data) => {
                              console.log('unstaked', updated_data);
                            })
                            .catch((error) => {
                              console.error(error.message);
                            });
                        }}
                        class="mt-2 flex justify-end pointer"
                      >
                        <span>Unstake now</span>
                      </div>
                </div>
              </div>
            </div>
          </div>
      {/each}
    {:else}
      <span class="text-s text-center mx-8"
        >No locks</span
      >
    {/if}
  </div>
{/if}

