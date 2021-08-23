<script>
  import { eth } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import { formatFiat } from '../components/helpers.js';
  import {
    toNum,
    calculateStakingEnds,
    getLockStatus,
    didLockExpired,
    calculateVeDough,
    initialize,
    data,
    boostToMax,
    unstakeDOUGH
  } from '../helpers/staking.js';

  $: isLoading = true;

  $: if ($eth.address && isLoading) {
    initialize($eth).then(() => {
      isLoading = false;
      data = data;
    });
  }
</script>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col-reverse items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- YOUR STAKING -->
      <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
        <div class="font-huge text-center mt-6">Your Staking</div>

        {#if data.accountLocks && data.accountLocks.length > 0}
          {#each data.accountLocks as lock, id}
            <!-- Let's show just the normal stakes, and the boosted ones. The stakes having a boostedPointer are obsolete stakes, so we won't show them -->
            {#if lock.boostedPointer == ''}
              <div
                class={lock.ejected
                  ? 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px opacity-60'
                  : 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px'}
              >
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Your total staked DOUGH</div>
                  <div class="flex items-center">
                    <div class="font-thin mr-2">Staking ends:</div>
                    <span>{calculateStakingEnds(lock).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="flex nowrap items-center p-1 justify-between mt-2">
                  <div class="grid grid-flow-col grid-cols-1 grid-rows-2">
                    <div class="sc-iybRtq gjVeBU">
                      <div class="font-24px">{formatFiat(toNum(lock.amount), ',', '.', '')}</div>
                      <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                      <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
                    </div>
                    <div class="sc-iybRtq gjVeBU float-left">
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
                  {#if lock.lockDuration / 60 != 36}
                    {#if !lock.boosted}
                      <div
                        on:click={async () => {
                          await boostToMax(id);
                          data = data;
                        }}
                        class="flex items-center cardbordergradient -mr-2 pointer"
                      >
                        <div class="flex items-center p-2">
                          <div class="mr-8px">Boost to Max</div>
                          <img
                            class="w-30px h-30px"
                            src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                            alt="ETH"
                          />
                        </div>
                      </div>
                    {:else}
                      <div class="flex items-center cardbordergradient -mr-2 pointer opacity-30">
                        <div class="flex items-center p-2">
                          <div class="mr-8px">Already Boosted</div>
                          <img
                            class="w-30px h-30px"
                            src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
                            alt="ETH"
                          />
                        </div>
                      </div>
                    {/if}
                  {/if}
                </div>
                <div class="mt-2 flex justify-start opacity-30 pointer">
                  <span>{getLockStatus(lock)}</span>
                </div>
                {#if !lock.withdrawn && !lock.ejected}
                  {#if didLockExpired(lock)}
                    <div
                      on:click={async () => {
                        await unstakeDOUGH(id, toNum(lock.amount));
                        data = data;
                      }}
                      class="mt-2 flex justify-end pointer"
                    >
                      <span>Unstake</span>
                    </div>
                  {:else}
                    <div class="mt-2 flex justify-end opacity-30 pointer"><span>Unstake</span></div>
                  {/if}
                {/if}
              </div>
            {/if}
          {/each}
        {:else}
          Insert placeholder No locks
        {/if}

        <a class="pt-6" href="#/new_staking"> go back on Staking page </a>
      </div>
      <!-- END YOUR STAKING -->
    </div>
  </div>
</div>
