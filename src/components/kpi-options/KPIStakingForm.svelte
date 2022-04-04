<script>
  import { eth, connectWeb3 } from '../../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import images from '../../config/images.json';
  import { formatToken } from '../helpers.js';
  import BigNumber from 'bignumber.js';
  import { toBN, toNum, calculateVeDough, fetchStakingStats } from '../../helpers/staking.js';
  import { onMount } from 'svelte';
  import * as kpiUtils from './kpiUtils';
  import StakedModal from '../../components/elements/StakedModal.svelte';

  export let wkpi
  export let stakingStats;

  export let init = () => {
    console.warn('Called uninitialsed init function');
  };

  $: stakeButtonText = 'Stake wDOUGH-KPI';
  $: isStaking = false;
  $: isApproving = false;
  $: veDOUGH = BigNumber(0);

  let stakeAmount = {
    label: '',
    bn: BigNumber(0),
  };
  let stakeDuration = 36;
  let receiver;
  let stakedModal;
  let successModal;

  onMount(() => {
    setMaximumStakingQuantity();
  });

  function setMaximumStakingQuantity() {
    stakeAmount.bn = wkpi;
    stakeAmount.label = toNum(wkpi, 4);
    stakeToVeDough(stakeAmount.bn);
  }

  function stakeToVeDough(options) {
    const doughPayouts = [
      { threshold: 15000000, value: 0.5 },
      { threshold: 10000000, value: 0.2 },
      { threshold: 7500000, value: 0.1 },
    ];

    const payout = doughPayouts.find(
      (_payout) => toNum(stakingStats.totalStakedDough) >= _payout.threshold,
    );
    const kpiReward = options.times(payout?.value ?? 0);

    const adjustedKpiRewards = calculateVeDough(kpiReward, stakeDuration);
    veDOUGH = toBN(adjustedKpiRewards);
  }
</script>

<StakedModal bind:this={successModal} />


<!-- STAKING FORM -->
<div class="flex flex-col w-full m-0">
  <div
    class="flex flex-col items-center w-full  cardbordergradient p-1px bg-lightgrey"
    class:input-box-loading={isStaking}
  >
    <div class="font-huge text-center mt-6">Stake</div>
    <div
      class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from border rounded-20px border-grey p-16px"
      class:input-invalid={stakeAmount.label && stakeAmount.bn.isGreaterThan(wkpi)}
    >
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
        <div class="font-thin" style="display: inline; cursor: pointer;">
          <div on:click={() => setMaximumStakingQuantity()}>
            Balance: {toNum(wkpi, 4)} wDOUGH-KPI
          </div>
        </div>
      </div>
      <div class="flex nowrap items-center p-1">
        <input
          bind:value={stakeAmount.label}
          class="swap-input-from"
          inputmode="decimal"
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="string"
          pattern="^[0-9]*[.]?[0-9]*$"
          placeholder="0.00"
          minlength="1"
          maxlength="79"
          spellcheck="false"
          disabled={isStaking || isApproving}
          onfocus="this.placeholder=''"
          on:change={() => {
            stakeAmount.label = formatToken(stakeAmount.label, '.', 18);
          }}
          on:keyup={async () => {
            const _stakeAmount = toBN(stakeAmount.label);
            stakeAmount.bn = _stakeAmount;
            stakeToVeDough(stakeAmount.bn);
          }}
        />
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px mr-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-KPI</span>
        </span>
      </div>
    </div>

    <div
      class="flex flex-col nowrap w-92pc mx-4pc swap-from border rounded-20px border-grey p-16px mt-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Stake Duration (6 to 36 months)</div>
        <div
          class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin"
          style="display: inline; cursor: pointer;"
        />
      </div>
      <div class="flex nowrap items-center pl-1 pt-1 pb-1">
        <input
          bind:value={stakeDuration}
          class="swap-input-from"
          inputmode="number"
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="number"
          pattern="^[0-9]?[0-9]*$"
          placeholder="36"
          minlength="1"
          maxlength="79"
          spellcheck="false"
          oninput="this.value=this.value.replace(/[^0-9]/g,'')"
          disabled={isStaking || isApproving}
          on:keyup={() => {
            if (stakeDuration > 36) {
              stakeDuration = 36;
            }
            stakeToVeDough(stakeAmount.bn);
          }}
        />
        <button
          disabled={isStaking || isApproving}
          on:click={() => {
            stakeDuration = 36;
            stakeToVeDough(stakeAmount.bn);
          }}
          class="pointer flex items-center stakinggradient shake"
        >
          <div class="flex items-center p-2">
            <div class=" mr-8px">3 Years</div>
            <img
              class="w-30px h-30px"
              src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png"
              alt="ETH"
            />
          </div>
        </button>
      </div>
    </div>

    <div
      style="display:none"
      class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from border rounded-20px border-grey p-16px"
    >
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Receiver</div>
        <div class="font-thin" style="display: inline; cursor: pointer;">
          <div
            on:click={() => {
              receiver = $eth.address;
            }}
          >
            {$eth.shortAddress}
          </div>
        </div>
      </div>
      <div class="flex nowrap items-center p-1">
        <input
          bind:value={receiver}
          class="swap-input-from"
          inputmode="text"
          placeholder="loading default address..."
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="text"
          spellcheck="false"
          disabled={isStaking || isApproving}
        />
      </div>
    </div>

    <div class="md:h-32px flex items-center pt-6">
      <div class="md:text-xs leading-3 font-thin mr-2">You will receive:</div>
      <div class="md:text-base mr-2">
        {toNum(veDOUGH)}
      </div>
      <img class="token-icon w-30px h-30px" src={images.veDough} alt="ETH" />
      <div class="px-4px font-thin">veDOUGH</div>
    </div>

    {#if $eth.address}
      {#if wkpi.eq(0)}
        <button disabled class="btn clear stake-button rounded-20px py-15px px-22px mx-4pc mt-4"
          >You don't own tokens
        </button>
      {:else if stakeAmount.bn && stakeAmount.bn.isGreaterThan(0)}
        {#if stakeAmount.bn.isGreaterThan(wkpi)}
          <button
            disabled
            class="btn clear stake-button rounded-20px py-15px px-22px mt-6 border-white"
            >Insufficient Balance</button
          >
        {:else if stakeDuration && stakeDuration > 5 && stakeDuration < 37}
          <button
            disabled={isStaking || isApproving}
            on:click={() => {
              stakeButtonText = 'Staking';
              isStaking = true;
              let interval = setInterval(() => {
                let occurrences = stakeButtonText.split('.').length - 1;

                if (occurrences < 3) {
                  stakeButtonText += '.';
                } else {
                  stakeButtonText = 'Staking';
                }
              }, 1000);
              kpiUtils
                .redeem($eth, init, stakeAmount.bn.toFixed(), stakeDuration)
                .then((updated_data) => {
                  console.log('staked', updated_data);

                  if (updated_data) wkpi = wkpi.minus(BigNumber(stakeAmount.bn))
                  clearInterval(interval);

                  setTimeout(() => {
                    stakeButtonText = 'Stake wDOUGH-KPI';
                    isStaking = false;
                    stakeAmount = {
                      label: '0',
                      bn: BigNumber(0),
                    };
                    stakeToVeDough(stakeAmount.bn);
                  }, 5000);

                })
                .catch((error) => {
                  console.error(error);

                  clearInterval(interval);
                  stakeButtonText = 'Stake wDOUGH-KPI';
                  isStaking = false;
                });
            }}
            class="btn clear stake-button rounded-20px py-15px px-22px mt-6 border-white"
            >{stakeButtonText}</button
          >
        {:else}
          <button
            disabled
            class="btn clear stake-button rounded-20px py-15px px-22px mt-6 border-white"
            >Duration not correct</button
          >
        {/if}
      {:else}
        <button disabled class="pointer btn clear stake-button rounded-20px py-15px px-22px mt-6"
          >Enter an amount</button
        >
      {/if}
    {:else}
      <button
        on:click={() => connectWeb3()}
        class="pointer btn clear stake-button rounded-20px py-15px px-22px mt-6"
        >Connect a Wallet</button
      >
    {/if}

    <button
      on:click={() => kpiUtils.addToken()}
      class="add-dough-metamask mb-4"
      data-aos="fade-up"
      data-aos-delay="300"
    >
      Add veDOUGH to MetaMask 🦊
    </button>
  </div>
</div>
