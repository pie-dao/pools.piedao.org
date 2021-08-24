<script>
  import { approve, approveMax, connectWeb3, subject, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import { _ } from 'svelte-i18n';
  import smartcontracts from '../config/smartcontracts.json';
  import images from '../config/images.json';
  import PartecipationJson from '../config/rewards/test.json';
  import displayNotification from '../notifications';
  import { parseEther } from '@ethersproject/units';
  import { isAddress } from '@pie-dao/utils';
  import { createParticipationTree } from '../classes/MerkleTreeUtils';
  import { formatFiat, formatToken } from '../components/helpers.js';
  import {
    toNum,
    toBN,
    sharesTimeLock,
    veDOUGH,
    dataObj,
    initialize 
  } from '../helpers/staking.js';

  import StakingRewards from '../components/StakingRewards.svelte';
  import StakingPositions from '../components/StakingPositions.svelte';

  const minLockAmount = 1;

  $: data = dataObj;
  $: isLoading = true;
  $: hasLoaded = false;

  $: stakeButtonText = 'Stake';
  $: isStaking = false;
  $: approveButtonText = 'Approve';
  $: isApproving = false;

  let stakeAmount;
  let stakeDuration = 36;
  let receiver;

  $: if ($eth.address && isLoading && !hasLoaded) {
    hasLoaded = true;

    initialize($eth).then(updated_data => {
      isLoading = false;
      data = updated_data;
      receiver = $eth.address;
    }).catch(error => {
      hasLoaded = false;
      console.error(error);
    });
  }
  
	function handleUpdate(event) {
		data = event.detail.data;
    data = data;
	}   

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

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

    try {
      // resetting the approve to zero, before initiating a new approval...
      if (
        !data.accountDepositTokenAllowance.isEqualTo(0) &&
        !data.accountDepositTokenAllowance.isEqualTo(ethers.constants.MaxUint256)
      ) {
        await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
      }

      await approveMax(smartcontracts.dough, smartcontracts.doughStaking, { gasLimit: 100000 });
      data.accountDepositTokenAllowance = ethers.constants.MaxUint256;

      clearInterval(interval);
      approveButtonText = 'Approve';
      isApproving = false;
    } catch (error) {
      clearInterval(interval);
      approveButtonText = 'Approve';
      isApproving = false;

      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });
    }
  }

  async function claim() {
    const proof = prepareProofs();
    console.log('proof', proof);

    try {
      const { emitter } = displayNotification(await veDOUGH.claim(proof.proof));

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            displayNotification({
              autoDismiss: 15000,
              message: `Pay day baby!`,
              type: 'success',
            });
            stakeAmount = 0;
            subscription.unsubscribe();

            data = await fetchStakingData();
          },
        });
      });
    } catch (error) {
      console.error('Error on Claim', [error.message]);

      displayNotification({
        autoDismiss: 15000,
        message: 'Sorry, an error occurred while claiming your rewards. Please try again later.',
        type: 'error',
      });
    }
  }

  function prepareProofs() {
    if (!$eth.address) return;
    const merkleTree = createParticipationTree(PartecipationJson);

    console.log('merkleTree', merkleTree);
    const leaf = merkleTree.leafs.find(
      (item) => item.address.toLowerCase() === $eth.address.toLowerCase(),
    );

    return {
      valid: leaf ? true : false,
      proof: leaf ? merkleTree.merkleTree.getProof(leaf.leaf) : null,
    };
  }

  const safeFlow = async () => {
    const Errors = {
      NOT_CONNECTED: {
        code: 1,
        message: 'The wallet is not connected or signer not available',
      },
      NOT_APPROVED: {
        code: 2,
        message: 'Allowance too low',
      },
      NOT_INITIALIZED: {
        code: 2,
        message: 'Timelock not initialized',
      },
      WRONG_DURATION: {
        code: 2,
        message: 'Duration Value incorrect',
      },
      TOO_SMALL: {
        code: 4,
        message: 'Deposit amount too small',
      },
      NOT_VALID_ADDRESS: {
        code: 2,
        message: 'Receiver is not a valid address',
      },
    };

    // Check connection to wallet
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return Errors.NOT_CONNECTED;
    }

    if (!sharesTimeLock) {
      displayNotification({ message: Errors.NOT_INITIALIZED.message, type: 'hint' });
      return Errors.NOT_INITIALIZED;
    }

    // Check connection to wallet
    if (stakeAmount < minLockAmount) {
      displayNotification({ message: 'Deposit amount too small', type: 'hint' });
      return Errors.NOT_CONNECTED;
    }

    if (!stakeDuration) {
      displayNotification({ message: Errors.WRONG_DURATION.message, type: 'hint' });
      return Errors.WRONG_DURATION;
    }

    if (!isAddress(receiver)) {
      displayNotification({ message: Errors.NOT_VALID_ADDRESS.message, type: 'hint' });
      return Errors.NOT_VALID_ADDRESS;
    }
    return false;
  };

  async function stakeDOUGH() {
    const error = await safeFlow();
    if (error) {
      console.log('error', error);
      return;
    }

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

    try {
      const { emitter } = displayNotification(
        await sharesTimeLock.depositByMonths(
          parseEther(stakeAmount.toString()),
          stakeDuration,
          receiver,
        ),
      );

      emitter.on('txConfirmed', async () => {
        const subscription = subject('blockNumber').subscribe({
          next: async () => {
            clearInterval(interval);
            stakeButtonText = 'Success! 🥳';
            isStaking = false;

            setTimeout(() => {
              stakeButtonText = 'Stake';
              stakeAmount = 0;
            }, 5000);

            displayNotification({
              autoDismiss: 15000,
              message: `You staked successfully`,
              type: 'success',
            });

            subscription.unsubscribe();

            data = await fetchStakingData();
          },
        });
      });
    } catch (error) {
      clearInterval(interval);
      stakeButtonText = 'Stake';
      isStaking = false;

      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: 'error',
      });
    }
  }
</script>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>

<div class="flex w-100pc py-20px flex flex-col items-center">
  <div
    class="w-full flex flex-col-reverse lg:flex-row items-start px-4 md:max-w-700px lg:px-4 lg:max-w-1280px"
  >
    <div class="flex flex-col w-full m-0 lg:w-49pc md:mr-1pc">
      <!-- SUMMARY -->
      <div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
        <div class="font-huge text-center mt-6">Summary</div>
        <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Total staked DOUGH</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">{formatFiat(toNum(data.totalStaked), ',', '.', '')}</div>
              <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
            </span>
          </div>
        </div>
        <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Your veDOUGH</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">
                {formatFiat(toNum(data.accountVeTokenBalance), ',', '.', '')}
              </div>
              <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
            </span>
          </div>
        </div>
        <div
          class="flex flex-col nowrap w-92pc mx-4pc mt-4 mb-6 swap-from rounded-20px bg-white p-16px"
        >
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Claimable Rewards</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">
                {formatFiat(toNum(data.accountWithdrawableRewards), ',', '.', '')}
              </div>
              <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">RWRD</span>
            </span>
          </div>
          {#if !data.accountWithdrawableRewards.eq(0)}
            <button class="pointer" on:click={claim}> Claim now</button>
          {/if}
        </div>
      </div>
      <!-- END SUMMARY -->

      <!-- YOUR STAKING -->
      {#key data}
        <StakingPositions data={data} isLoading={isLoading} itemsNumber=4 eth={$eth} on:update={handleUpdate}></StakingPositions>
      {/key}        
      <!-- END YOUR STAKING -->

      <!-- PAST REWARDS -->
      {#key data}
        <StakingRewards data={data} isLoading={isLoading} itemsNumber=4></StakingRewards>
      {/key}
      <!-- END PAST REWARDS -->
    </div>

    <!-- STAKING FORM -->
    <div class="flex flex-col w-full m-0  lg:w-49pc md:ml-1pc">
      {#if !isLoading}
        <div
          class="flex flex-col items-center w-full  cardbordergradient p-1px bg-lightgrey"
          class:input-box-loading={isStaking}
        >
          <div class="font-huge text-center mt-6">DOUGH Staking</div>
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
                on:change={() => {
                  //  1.123456789012345678
                  stakeAmount = formatToken(stakeAmount, '.', 18);
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
                type="text"
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
                }}
              />
              <div
                on:click={() => {
                  stakeDuration = 36;
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
                on:click={approveToken}
                class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white"
                >{approveButtonText}</button
              >
            {:else if stakeDuration && stakeDuration > 5 && stakeDuration < 37}
              <button
                on:click={stakeDOUGH}
                class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white"
                >{stakeButtonText}</button
              >
            {:else}
              <button
                disabled
                class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white"
                >Duration not correct</button
              >
            {/if}
          {:else}
            <button
              disabled
              class="pointer btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6"
              >Enter an amount</button
            >
          {/if}
          <!-- END STAKING FORM -->
        </div>
      {:else}
        Loading...
      {/if}
    </div>
    <!-- END STAKING FORM -->
  </div>
</div>
