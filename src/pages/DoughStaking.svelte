<script>
  import { approveMax, connectWeb3, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import smartcontracts from '../config/smartcontracts.json';
  import { get } from 'svelte/store';
  import images from '../config/images.json';
  import displayNotification from '../notifications';

  const ZeroEx = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';

  const toNum = (num) =>
    BigNumber(num.toString())
      .dividedBy(10 ** 18)
      .toFixed(4);

  $: needAllowance = true;
  $: isLoading = false;
  $: error = false;
  $: balanceError = false;

  let data = {
    totalStaked: BigNumber(0),
    rewardTokenSupply: BigNumber(0),
    accountRewardTokenBalance: BigNumber(0),
    accountWithdrawableRewards: BigNumber(0),
    accountWithdrawnRewards: BigNumber(0),
    accountDepositTokenBalance: BigNumber(0),
    accountLocks: [],
  };

  let stake = {
    amount: 0.0,
    duration: 1,
    receiver: ""
  };

  const fetchStakingData = async () => {
    const { provider, signer } = get(eth);
    let sharesTimeLock = new ethers.Contract(
      smartcontracts.doughStaking,
      sharesTimeLockABI,
      signer || provider,
    );
    let response = await sharesTimeLock.getStakingData($eth.address);

    let stakingData = {};

    Object.keys(response).forEach((key) => {
      if (key != 'accountLocks') {
        stakingData[key] = new BigNumber(response[key].toString());
      }
    });

    return stakingData;
  };

  // update data on address or block change
  $: if ($eth.address || $eth.currentBlockNumber) {
    stake.receiver = $eth.address;

    fetchStakingData().then((stakingData) => {
      data = stakingData;
      needAllowance = needApproval(data.accountDepositTokenAllowance);
    });
  }

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if (allowance.isEqualTo(0)) return true;
    if (allowance.isGreaterThanOrEqualTo(amount.bn)) return false;
  }

  async function approveToken() {
    console.log('inside approveToken');
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    const { emitter } = displayNotification(await approveMax(stake.receiver, ZeroEx));
    needAllowance = false;
    data = await fetchStakingData();

    await new Promise((resolve) =>
      emitter.on('txConfirmed', ({ blockNumber }) => {
        console.log("transaction has been confermed, stake shall be approved now...");
        resolve();
        return { message: `stake has been approved`, type: 'success', address: stake.receiver };
      }),
    );
  }

</script>

<div class="content flex flex-col pt-10pc justify-center spl">
  <div class="font-huge text-center">DOUGH Staking</div>
  <div class="font-thin text-lg text-center mt-10px mb-10px md:w-80pc">
    The new Stake, under development.
  </div>

  <div
    class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc"
  >
    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
        <div
          class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin"
          style="display: inline; cursor: pointer;"
        >
          <div
            on:click={() => {
              stake.amount = toNum(data.accountDepositTokenBalance);
            }}
          >
            Max balance: {toNum(data.accountDepositTokenBalance)}
          </div>
        </div>
      </div>
      <div class="flex nowrap items-center p-1">
        <input
          bind:value={stake.amount}
          class="swap-input-from"
          inputmode="decimal"
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="number"
          pattern="^[0-9]*[,]?[0-9]*$"
          placeholder="0.0"
          minlength="1"
          maxlength="79"
          spellcheck="false"
        />
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px mr-5px" src={images.doughtoken} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
        </span>
      </div>
    </div>

    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px mt-4">
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Stake Duration (Months)</div>
        <div
          class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin"
          style="display: inline; cursor: pointer;"
        >
          <div
            on:click={() => {
              stake.duration = 36;
            }}
          >
            Max 36 Months
          </div>
        </div>
      </div>
      <div class="flex nowrap items-center p-1">
        <input
          bind:value={stake.duration}
          class="swap-input-from"
          inputmode="number"
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="number"
          pattern="^[0-9]*[.]?[0-9]*$"
          placeholder="36"
          minlength="1"
          maxlength="79"
          spellcheck="false"
        />
        <span class="sc-iybRtq gjVeBU">
          <img class="h-auto w-24px mr-5px" src={images.simulator_hands} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">3 Years</span>
        </span>
      </div>
    </div>

    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px mt-4">
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Receiver</div>
      </div>
      <div class="flex nowrap items-center p-1">
        <input
          bind:value={stake.receiver}
          class="swap-input-from"
          inputmode="text"
          placeholder="loading default address..."
          title="Token Amount"
          autocomplete="off"
          autocorrect="off"
          type="text"
          spellcheck="false"
        />
      </div>
    </div>    

    {#if needAllowance}
      <button
        on:click={approveToken}
        class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Approve</button
      >
    {:else}
      <button
        class:error={error || isLoading || balanceError ? true : false}
        disabled={error || isLoading || balanceError ? true : false}
        class="error stake-button mt-10px rounded-20px p-15px w-100pc"
      >
        Review Your Stake
      </button>
    {/if}
  </div>
</div>
