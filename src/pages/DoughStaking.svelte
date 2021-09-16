<script>
  import { eth, connectWeb3 } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import { formatToken } from '../components/helpers.js';
  import { onDestroy, onMount } from 'svelte';
  import smartcontracts from '../config/smartcontracts.json';
  import displayNotification from '../notifications';
  import Calculator from '../classes/farming_simulator/Calculator.js';
  import {
    toNum,
    toBN,
    stakeDOUGH,
    dataObj,
    initialize,
    approveToken,
    observable
  } from '../helpers/staking.js';

  import StakingRewards from '../components/StakingRewards.svelte';
  import StakingPositions from '../components/StakingPositions.svelte';
  import StakingSummary from '../components/StakingSummary.svelte';
  import StakingStats from '../components/StakingStats.svelte';

  import ProgressBar from '@okrad/svelte-progressbar';

  // creating the Calculator class instance...
  let calculator = new Calculator();
  let veDOUGH = 0;

  $: data = dataObj;
  $: stakeButtonText = 'Stake DOUGH';
  $: isStaking = false;
  $: isLoading = false;
  $: approveButtonText = 'Approve';
  $: isApproving = false;

  let stakeAmount;
  let stakeDuration = 36;
  let receiver;
  let observer = null;
  let refreshInterval = null;
  let refreshValue = 0;

  onDestroy(() => {
    if (observer) {
      observer.unsubscribe();
    }
  });

  $: if ($eth.address) {
    if (receiver !== $eth.address) {
      if (!isLoading) {
        isLoading = true;
        init();
      }
    }
  }

  function init() {
    initialize($eth)
      .then((updated_data) => {
        isLoading = false;
        data = updated_data;
        receiver = $eth.address;

        if (observer) {
          observer.unsubscribe();
        }

        if (refreshInterval) {
          clearInterval(refreshInterval);
        }

        observer = observable.subscribe({
          next(updated_data) {
            data = updated_data;
          },
        });

        refreshInterval = startLoadingInterval();
      })
      .catch((error) => {
        isLoading = false;
        console.error(error);
      });
  }

  function startLoadingInterval() {
    return setInterval(() => {
      if (refreshValue < 100) {
        refreshValue += 1;
      } else {
        clearInterval(refreshInterval);
        setTimeout(() => {
          refreshValue = 0;
          setTimeout(() => {
            refreshInterval = startLoadingInterval();
          }, 1000);
        }, 1000);
      }
    }, 30);
  }

  function handleUpdate(event) {
    data = event.detail.data;
    data = data;
  }

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
            image: images.veDough,
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

  function calculateVeDOUGH() {
    veDOUGH = calculator.calculateVeDough(stakeAmount, stakeDuration);
    veDOUGH = formatToken(veDOUGH, '.', 2);
  }
</script>

<div class="font-huge text-center">Dough Staking</div>
<div class="font-thin text-lg text-center mt-10px">Get paid for Governing the DAO</div>

<!-- TODO: Nico, please fix me :) -->
<div style="position: absolute; top: 100px; right: 100px;">
  <ProgressBar
    style="radial"
    width="50px"
    series={[refreshValue]}
    thickness={5}
    thresholds={[
      {
        till: 50,
        color: '#800000',
      },
      {
        till: 100,
        color: '#008000',
      },
    ]}
  />
</div>

<div class="flex w-100pc pt-0 pb-20px flex flex-col items-center">
  {#key data}
    <StakingStats />
  {/key}
  <div
    class="w-full flex flex-col-reverse lg:flex-row items-start px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      {#key data}
        <!-- SUMMARY -->
        <StakingSummary {data} eth={$eth} on:update={handleUpdate} />
        <!-- END SUMMARY -->

        <!-- YOUR STAKING -->
        <StakingPositions {data} {isLoading} itemsNumber="3" eth={$eth} on:update={handleUpdate} />
        <!-- END YOUR STAKING -->

        <!-- PAST REWARDS -->
        <StakingRewards {data} {isLoading} itemsNumber="3" eth={$eth}/>
        <!-- END PAST REWARDS -->
      {/key}
    </div>

    <!-- STAKING FORM -->
    <div class="flex flex-col w-full m-0  lg:w-49pc md:ml-1pc">
      {#if !isLoading}
        <div
          class="flex flex-col items-center w-full  cardbordergradient p-1px bg-lightgrey"
          class:input-box-loading={isStaking}
        >
          <div class="font-huge text-center mt-6">Stake</div>
          <div
            class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from border rounded-20px border-grey p-16px"
            class:input-invalid={stakeAmount &&
              toBN(stakeAmount).isGreaterThan(data.accountDepositTokenBalance)}
          >
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
              <div class="font-thin" style="display: inline; cursor: pointer;">
                <div
                  on:click={() => {
                    stakeAmount = toNum(data.accountDepositTokenBalance);
                    calculateVeDOUGH();
                  }}
                >
                  Balance: {toNum(data.accountDepositTokenBalance)} DOUGH
                </div>
              </div>
            </div>
            <div class="flex nowrap items-center p-1">
              <input
                bind:value={stakeAmount}
                class="swap-input-from"
                inputmode="decimal"
                title="Token Amount"
                autocomplete="off"
                autocorrect="off"
                type="string"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="0.0"
                minlength="1"
                maxlength="79"
                spellcheck="false"
                disabled={isStaking || isApproving}
                onfocus="this.placeholder=''" 
                on:change={() => {
                  stakeAmount = formatToken(stakeAmount, '.', 18);
                }}
                on:keyup={() => {
                  calculateVeDOUGH();
                }}
              />
              <span class="sc-iybRtq gjVeBU">
                <img class="h-auto w-24px mr-5px" src={images.doughtoken} alt="dough token" />
                <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
              </span>
            </div>
          </div>

          <div
            class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from border rounded-20px border-grey p-16px mt-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex nowrap intems-center p-1 font-thin">
                Stake Duration (6 to 36 months)
              </div>
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

                  calculateVeDOUGH();
                }}
              />
              <div
                on:click={() => {
                  stakeDuration = 36;

                  calculateVeDOUGH();
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
              </div>
            </div>
          </div>

          <div
            class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from border rounded-20px border-grey p-16px mt-4"
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
              {veDOUGH}
            </div>
            <img class="token-icon w-30px h-30px" src={images.veDough} alt="ETH" />
            <div class="px-4px font-thin">veDOUGH</div>
          </div>

          {#if $eth.address}
            {#if data.accountDepositTokenBalance.eq(0)}
              <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-4"
                >You don't own tokens
              </button>
            {:else if stakeAmount !== null && stakeAmount !== undefined && stakeAmount > 0}
              {#if toBN(stakeAmount).isGreaterThan(data.accountDepositTokenBalance)}
                <button
                  disabled
                  class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white"
                  >Insufficient Balance</button
                >
              {:else if toBN(stakeAmount).isGreaterThan(data.accountDepositTokenAllowance)}
                <button
                  on:click={() => {
                    approveButtonText = 'Approving';
                    isApproving = true;

                    let interval = setInterval(() => {
                      let occurrences = approveButtonText.split('.').length - 1;

                      if (occurrences < 3) {
                        approveButtonText += '.';
                      } else {
                        approveButtonText = 'Approving';
                      }
                    }, 1000);

                    approveToken($eth)
                      .then((updated_data) => {
                        data = updated_data;
                        data = data;

                        clearInterval(interval);
                        approveButtonText = 'Approve';
                        isApproving = false;
                      })
                      .catch((error) => {
                        console.error(error);

                        clearInterval(interval);
                        approveButtonText = 'Approve';
                        isApproving = false;
                      });
                  }}
                  class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white"
                  >{approveButtonText}</button
                >
              {:else if stakeDuration && stakeDuration > 5 && stakeDuration < 37}
                <button
                  disabled={!receiver}
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

                    stakeDOUGH(stakeAmount, stakeDuration, receiver, $eth)
                      .then((updated_data) => {
                        data = updated_data;
                        data = data;

                        clearInterval(interval);
                        stakeButtonText = 'Success! 🥳';

                        setTimeout(() => {
                          stakeButtonText = 'Stake DOUGH';
                          isStaking = false;
                          stakeAmount = 0;
                          calculateVeDOUGH();
                        }, 5000);
                      })
                      .catch((error) => {
                        console.error(error);

                        clearInterval(interval);
                        stakeButtonText = 'Stake DOUGH';
                        isStaking = false;
                      });
                  }}
                  class="btn clear stake-button rounded-20px p-15px w-50pc mx-4pc mt-6 border-white"
                  >{stakeButtonText}</button
                >
              {:else}
                <button
                  disabled
                  class="btn clear stake-button rounded-20px p-15px w-50pc mx-4pc mt-6 border-white"
                  >Duration not correct</button
                >
              {/if}
            {:else}
              <button
                disabled
                class="pointer btn clear stake-button rounded-20px p-15px w-50pc mx-4pc mt-6"
                >Enter an amount</button
              >
            {/if}
          {:else}
          <button
            on:click={() => connectWeb3()}
            class="pointer btn clear stake-button rounded-20px p-15px w-50pc mx-4pc mt-6"
            >Connect a Wallet</button
          >
          {/if}

          <button
            on:click={() => addToken()}
            class="add-dough-metamask mb-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Add to MetaMask 🦊
          </button>
          <!-- END STAKING FORM -->
        </div>
      {:else}
        Loading...
      {/if}
    </div>
    <!-- END STAKING FORM -->
  </div>
</div>
