<script>
  import { approve, connectWeb3, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import smartcontracts from '../config/smartcontracts.json';
  import { get } from 'svelte/store';
  import images from '../config/images.json';
  import displayNotification from '../notifications';


  const toNum = (num) =>
    BigNumber(num.toString())
      .dividedBy(10 ** 18)
      .toFixed(4);

  $: needAllowance = true;
  $: isLoading = true;
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

  $: if($eth.provider && $eth.address && isLoading) {
      fetchStakingData().then((stakingData) => {
        isLoading = false;
        data = stakingData;
        stake.receiver = $eth.address;
        checkApproval(data.accountDepositTokenAllowance);
      });
  }

  function checkApproval(allowance) {
    if(stake.amount) {
      let stakeAmount = BigNumber(stake.amount.toString()).multipliedBy(10 ** 18);

if(allowance.isGreaterThanOrEqualTo(stakeAmount)) {
  needAllowance = false;
} else {
  needAllowance = true;
}
    }
  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    // resetting the approve to zero, before initiating a new approval...
    if(!data.accountDepositTokenAllowance.isEqualTo(0)) {
      console.log("resetting approval...");
      await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
    }

    try {
      let stakeAmount = BigNumber(stake.amount.toString()).multipliedBy(10 ** 18);
      console.log("starting new approval...");
      const { emitter } = await approve(smartcontracts.dough, smartcontracts.doughStaking, stakeAmount.toString());
      needAllowance = false;  
      console.log("approval completed", needAllowance);

      await new Promise((resolve) =>
      emitter.on('txConfirmed', ({ blockNumber }) => {
        console.log("transaction has been confirmed, stake shall be approved now...");
        resolve();
        return { message: `stake has been approved`, type: 'success', address: stake.receiver };
      }),
    );      
    } catch(error) {
      console.error("PREFIX_" + error);
    }
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
          on:keyup={() => { checkApproval(data.accountDepositTokenAllowance)}}
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
        disabled={error || isLoading || balanceError ? true : false}
        class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Approve</button
      >
    {:else}
      <button
        class:error={error || isLoading || balanceError ? true : false}
        disabled={error || isLoading || balanceError ? true : false}
        class="error stake-button mt-10px rounded-20px p-15px w-100pc"
      >
        Stake Your Coins
      </button>
    {/if}
  </div>
</div>
