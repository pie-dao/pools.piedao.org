<script>
  import { approve, connectWeb3, subject, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import smartcontracts from '../config/smartcontracts.json';
  import { get } from 'svelte/store';
  import images from '../config/images.json';
  import displayNotification from '../notifications';
  import { formatEther, parseEther } from '@ethersproject/units';

  const toNum = (num) =>
    BigNumber(num.toString())
      .dividedBy(10 ** 18)
      .toFixed(2);

  $: needAllowance = true;
  $: isLoading = true;
  $: stakeError = false;

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

  let unstake = {
    amount: 0.0
  }

  let sharesTimeLock = false;

  const fetchStakingData = async () => {
    let response = await sharesTimeLock.getStakingData($eth.address);

    Object.keys(response).forEach((key) => {
      if (key != 'accountLocks') {
        data[key] = new BigNumber(response[key].toString());
      } else {
        let locks = [];

        response[key].forEach((lock, index) => {
          if(lock.amount.toString() != '0') {
            locks.push({
              amount: new BigNumber(lock.amount.toString()),
              lockDuration: lock.lockDuration,
              lockedAt: lock.lockedAt,
              lockId: index
            });
          }
        });

        data[key] = locks;
      }
    });
    
    console.log(data);
    data = data;
    return data;
  };

  $: if($eth.address && isLoading) {
    initialize();
  }

  async function initialize() {
    try {
      sharesTimeLock = new ethers.Contract(
        smartcontracts.doughStaking,
        sharesTimeLockABI,
        $eth.signer || $eth.provider,
      );

      await fetchStakingData();

      isLoading = false;
      stake.receiver = $eth.address;
      checkApproval(data.accountDepositTokenAllowance);
    } catch(e) {
      console.log('Something went wrong...', e);
    }
    
  }

  function checkApproval(allowance) {
    if(stake.amount && allowance) {
      stakeError = false;
      let stakeAmount = BigNumber(stake.amount.toString()).multipliedBy(10 ** 18);

      if(allowance.isGreaterThanOrEqualTo(stakeAmount)) {
        needAllowance = false;
      } else {
        needAllowance = true;
      }
    } else {
      stakeError = true;
    }
  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    try {
      // resetting the approve to zero, before initiating a new approval...
      if(!data.accountDepositTokenAllowance.isEqualTo(0)) {
        await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
      }

      let stakeAmount = BigNumber(stake.amount.toString()).multipliedBy(10 ** 18);     
      await approve(smartcontracts.dough, smartcontracts.doughStaking, stakeAmount.toString(), {gasLimit: 100000});
      needAllowance = false; 
      
    } catch(error) {
      stakeError = true;
      needAllowance = true;
    }
  }

  async function stakeDOUGH() {
    if(!sharesTimeLock) return;

    try {
      let response = await sharesTimeLock.depositByMonths(
        parseEther(stake.amount.toString()), 
        stake.duration, 
        stake.receiver);

      const { emitter } = displayNotification({
        hash: response.hash,
      });

      emitter.on("txConfirmed", async() => {

        displayNotification({
          message: `You staked ${stake.amount.toString()} DOUGH. Your new stake will appear in the list in a really short while...`,
          type: "success",
        });       

        const subscription = subject("blockNumber").subscribe({
          next: async () => {
            await fetchStakingData();
            console.log("fetchStakingData", data);               

            subscription.unsubscribe();
          },
        });          
      });

    } catch(error) {
      console.error(error);
    }
  }

  async function unstakeDOUGH(id, lockAmount) {
    if(!sharesTimeLock) return;

    try {
      let response = await sharesTimeLock.withdraw(id);

      const { emitter } = displayNotification({
        hash: response.hash
      });

      emitter.on("txConfirmed", async() => {
        displayNotification({
          message: `You unstaked ${lockAmount.toString()} DOUGH`,
          type: "success",
        });

        const subscription = subject("blockNumber").subscribe({
          next: async () => {
            console.log("unstakeDOUGH -> blockNumber");

            await fetchStakingData();
            console.log("fetchStakingData", data);   

            subscription.unsubscribe();
          },
        });      
      });

    } catch(error) {
      if(error.message.includes('lock not expired')) {
        displayNotification({
          message: 'can\'t unstake, lock not expired.',
          type: "error",
        });
      } else {
        displayNotification({
          message: 'sorry, some error occurred while unstaking. Please try again later...',
          type: "error",
        });        
      }
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
        class:error={isLoading || stakeError ? true : false}
        disabled={isLoading || stakeError ? true : false}
        class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Approve</button
      >
    {:else}
      <button
      on:click={stakeDOUGH}
        class:error={isLoading || stakeError ? true : false}
        disabled={isLoading || stakeError ? true : false}
        class="error stake-button mt-10px rounded-20px p-15px w-100pc"
      >
        Stake Your Coins
      </button>
    {/if}
  </div>

  <div
  class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc mt-4"
>
  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        Total Staked: {toNum(data.totalStaked)}
        <img class="h-auto w-24px mr-5px ml-4" src={images.doughtoken} alt="dough token" />
        <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
      </span>
    </div>
    <div>Select the item you wish to unstake from the list.</div>
  </div>   

  <ul>
    {#each data.accountLocks as lock, id}
	  <li class="swap-container mt-8 stake-button">
      <button on:click={() => {unstakeDOUGH(lock.lockId, toNum(lock.amount))}}>
        <div>{toNum(lock.amount)} DOUGH</div>
        <div>staked for: {lock.lockDuration / 60} Months</div>
        <div>started: {new Date(lock.lockedAt * 1000).toLocaleString()}</div>
      </button>
	  </li>
    {/each}
  </ul>
</div>
</div>
