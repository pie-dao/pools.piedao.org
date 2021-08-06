<script>
  import { approve, approveMax, connectWeb3, subject, eth } from '../stores/eth.js';
  import { ethers } from 'ethers';
  import BigNumber from 'bignumber.js';
  import { _ } from 'svelte-i18n';
  import sharesTimeLockABI from '../abis/sharesTimeLock.json';
  import veDoughABI from '../abis/veDoughABI.json';
  import smartcontracts from '../config/smartcontracts.json';
  import images from '../config/images.json';
  import PartecipationJson from '../config/rewards/test.json'
  import displayNotification from '../notifications';
  import { parseEther } from '@ethersproject/units';
  import { isAddress } from '@pie-dao/utils';
  import { createParticipationTree } from '../classes/MerkleTreeUtils';
  import {subgraphRequest} from '../helpers/subgraph.js';
  import { formatFiat } from '../components/helpers.js';
  import Modal from '../components/elements/Modal.svelte';

  let modalinfo;

  const toNum = (num) =>
    BigNumber(num.toString())
      .dividedBy(10 ** 18)
      .toFixed(2);

  const toBN = (num) =>
    BigNumber(num.toString())
      .multipliedBy(10 ** 18);

  const minLockAmount = 1;
  
  // All the epochs where rewards are available.
  $: epochs = [];
  $: isLoading = true;  

  let data = {
    totalStaked: BigNumber(0),
    veTokenTotalSupply: BigNumber(0),
    accountVeTokenBalance: BigNumber(0), //amount of veDOUGH you have
    accountWithdrawableRewards: BigNumber(0), //amount is in reward Pie
    accountWithdrawnRewards: BigNumber(0),
    accountDepositTokenBalance: BigNumber(0),
    accountLocks: [],
    rewards: []
  };

  let stakeAmount = 0;
  let stakeDuration = 36;
  let receiver = "";

  let unstake = {
    amount: 0.0
  }

  let sharesTimeLock = false;
  let veDOUGH = false;

  function calculateStakingEnds(lock) {
    let startDate = new Date(lock.lockedAt * 1000);
    let lockDuration = lock.lockDuration / 60;
    
    //startDate.setMonth(startDate.getMonth() + lockDuration);
    
    // TODO: remove this line, and use the previous one...
    startDate.setMinutes(startDate.getMinutes() + lockDuration);

    return startDate;
  }

  function getLockStatus(lock) {
    if(lock.withdrawn) {
      return "withdrawn";
    } else {
      if(lock.ejected) {
        return "ejected";
      } else {
        return "running";
      }
    }
  }

  function didLockExpired(lock) {
    let endDate = calculateStakingEnds(lock);
    let nowDate = new Date();
    return nowDate > endDate;
  }

  async function fetchStakingDataGraph(address) {
    try {
      const response = await subgraphRequest('https://api.thegraph.com/subgraphs/name/chiptuttofuso/piedaosubgraphdevelop', {
      "stakers": {
        __args: {
          where: { id: address.toLowerCase() }
        },
        id: true,
        totalStaked: true,
        veTokenTotalSupply: true,
        accountVeTokenBalance: true,
        accountWithdrawableRewards: true,
        accountWithdrawnRewards: true,
        accountDepositTokenBalance: true,
        accountDepositTokenAllowance: true,
        accountLocks: {
          id: true,
          lockId: true,
          lockDuration: true,
          lockedAt: true,
          amount: true,
          withdrawn: true,
          ejected: true,
          boosted: true,
          boostedPointer: true
        }
      },
      "rewards": {
        __args: {
          where: { staker: address.toLowerCase() }
        },
        id: true,
        timestamp: true,
        amount: true,
        type: true
      }      
    });
    
    return response;
    } catch(error) {
      throw new Error("fetchStakingDataGraph: " + error.message);
    }
  }

  const fetchStakingData = async () => {
    let response = null;
    let staker = null;
    let rewards = null;

    // this is a fallback in case the graph is not working...
    try {
      // using graph...
      response = await fetchStakingDataGraph($eth.address);
      console.log("response for " + $eth.address.toLowerCase(), response);
      rewards = response.rewards;
      staker = response.stakers[0];
    } catch(error) {
      console.error(error);
      // using onchain as fallback...
      staker = await sharesTimeLock.getStakingData($eth.address);
      rewards = data.rewards.length > 0 ? data.rewards : [];
    }

    Object.keys(staker).forEach((key) => {
      if (key != 'accountLocks') {
        data[key] = new BigNumber(staker[key].toString());
      } else {
        let locks = [];

        staker[key].forEach((lock, index) => {
          if(lock.amount.toString() != '0') {
            locks.push({
              amount: new BigNumber(lock.amount.toString()),
              lockDuration: lock.lockDuration,
              lockedAt: lock.lockedAt,
              lockId: lock.lockId || index,
              // when the graph is not working properly,
              // all those fields will be undefined...
              withdrawn: lock.withdrawn,
              ejected: lock.ejected,
              boosted: lock.boosted,
              boostedPointer: lock.boostedPointer
            });
          }
        });

        locks.sort(function(lock_a, lock_b) {
          return lock_a.lockedAt - lock_b.lockedAt;
        });        

        data[key] = locks;
      }
    });

    data["rewards"] = rewards;
    console.log("fetchStakingData", data);

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

      veDOUGH = new ethers.Contract(
        smartcontracts.veDOUGH,
        veDoughABI,
        $eth.signer || $eth.provider,
      );

      await fetchStakingData();

      receiver = $eth.address;
      console.log(prepareProofs());
      isLoading = false;
    } catch(e) {
      console.log('Something went wrong...', e);
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
      if(
        !data.accountDepositTokenAllowance.isEqualTo(0) && 
        !data.accountDepositTokenAllowance.isEqualTo(ethers.constants.MaxUint256)
      ) {

        await approve(smartcontracts.dough, smartcontracts.doughStaking, 0);
      }

      
      await approveMax(smartcontracts.dough, smartcontracts.doughStaking, {gasLimit: 100000});
      data.accountDepositTokenAllowance = ethers.constants.MaxUint256;
    } catch(error) {
      console.log('error', error);
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: "error",
      });
    }
  }

  async function claim() {
    const proof = prepareProofs();
    console.log('proof', proof);

    try {
      const { emitter } = displayNotification( await veDOUGH.claim(proof.proof));

      emitter.on("txConfirmed", async() => {
        const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `Pay day baby!`,
                type: "success",
              });
              stakeAmount = 0;
              await fetchStakingData();
              subscription.unsubscribe();
            },
          });
        
        
      });

    } catch(error) {
      console.error("Error on Claim", [error.message]);

      displayNotification({
        autoDismiss: 15000,
        message: "Sorry, an error occurred while claiming your rewards. Please try again later.",
        type: "error",
      });
    }

  }

  function prepareProofs() {
    if(!$eth.address) return;
    const merkleTree = createParticipationTree(PartecipationJson);
      
    console.log('merkleTree', merkleTree)
    const leaf = merkleTree.leafs.find((item) => item.address.toLowerCase() === $eth.address.toLowerCase());

    return {
      valid: leaf ? true : false,
      proof: leaf ? merkleTree.merkleTree.getProof(leaf.leaf) : null
    }
  }

  const safeFlow = async () => {
      const Errors = {
        NOT_CONNECTED: {
          code: 1,
          message: "The wallet is not connected or signer not available"
        },
        NOT_APPROVED: {
          code: 2,
          message: "Allowance too low"
        },
        NOT_INITIALIZED: {
          code: 2,
          message: "Timelock not initialized"
        },
        WRONG_DURATION: {
          code: 2,
          message: "Duration Value incorrect"
        },
        TOO_SMALL: {
        code: 4,
          message: "Deposit amount too small"
        },
        NOT_VALID_ADDRESS: {
          code: 2,
          message: "Receiver is not a valid address"
        }
      }

      // Check connection to wallet
      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
        connectWeb3();
        return Errors.NOT_CONNECTED;
      }

      if(!sharesTimeLock) {
        displayNotification({ message: Errors.NOT_INITIALIZED.message, type: "hint" });
        return Errors.NOT_INITIALIZED;
      };

      // Check connection to wallet
      if (stakeAmount < minLockAmount) {
        displayNotification({ message: "Deposit amount too small", type: "hint" });
        return Errors.NOT_CONNECTED;
      }

      if(!stakeDuration) {
        displayNotification({ message: Errors.WRONG_DURATION.message, type: "hint" });
        return Errors.WRONG_DURATION;
      };

      if(!isAddress(receiver)) {
        displayNotification({ message: Errors.NOT_VALID_ADDRESS.message, type: "hint" });
        return Errors.NOT_VALID_ADDRESS;

      }
      return false;
  }

  async function stakeDOUGH() {
    const error = await safeFlow();
    if(error) {
      console.log('error', error)
      return;
    }

    try {
      const { emitter } = displayNotification( await sharesTimeLock.depositByMonths(
        parseEther(stakeAmount.toString()), 
        stakeDuration, 
        receiver
      ));

      emitter.on("txConfirmed", async() => {
        const subscription = subject("blockNumber").subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: `You staked successfully`,
                type: "success",
              });
              stakeAmount = 0;
              await fetchStakingData();
              subscription.unsubscribe();
            },
          });
        
        
      });

    } catch(error) {
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
        type: "error",
      });
    }
  }

  async function boostToMax(id) {
    if(!sharesTimeLock) return;

    try {
      let response = await sharesTimeLock.boostToMax(id);

      const { emitter } = displayNotification({
        hash: response.hash
      });

      emitter.on("txConfirmed", async() => {
        displayNotification({
          message: `You boosted your stake to 36 months!`,
          type: "success",
        });

        const subscription = subject("blockNumber").subscribe({
          next: async () => {
            console.log("boostToMax -> blockNumber");

            await fetchStakingData();

            subscription.unsubscribe();
          },
        });      
      });

    } catch(error) {
      console.log(error);
      displayNotification({
          message: e.message,
          type: "error",
        });
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
            subscription.unsubscribe();
          },
        });      
      });

    } catch(error) {
      console.log(error.message);
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

  function calculateVeDough(stakedDough, commitment) {
    let k = 56.0268900276223;
    let commitmentMultiplier = (commitment / k) * Math.log10(commitment);
    let veDOUGH = stakedDough * commitmentMultiplier;
    return toNum(veDOUGH);
  }

</script>

<Modal title="Slashed Rewards" backgroundColor="#f3f3f3" bind:this="{modalinfo}">
  <span slot="content" class="p-4 font-thin">
    <strong>What's that?</strong><br/>
    If you don't partecipate, you're a looser.<br/>
    If you're a looser, we'll slash you.<br/><br/>

    <strong>why?</strong><br/>
    Sorry man.<br/>
    This is your own fault.<br/>
  </span>
</Modal>

<div class="font-huge text-center">Governance mining</div>
<div class="font-thin text-lg text-center mt-10px mb-10px">Get paid for Governing the DAO</div>


<div class="flex w-100pc py-20px flex flex-col items-center">
<div class="w-full flex flex-col-reverse lg:flex-row items-start px-4 md:max-w-700px lg:px-4 lg:max-w-1280px">


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
              <div class="font-24px">{formatFiat(toNum(data.accountVeTokenBalance), ',', '.', '')}</div>
              <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
            </span>
          </div>     
      </div>
      <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 mb-6 swap-from rounded-20px bg-white p-16px">
        <div class="flex items-center justify-between">
          <div class="flex nowrap intems-center p-1 font-thin">Claimable Rewards</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">{formatFiat(toNum(data.accountWithdrawableRewards), ',', '.', '')}</div>
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
    <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
      <div class="font-huge text-center mt-6">Your Staking</div>

      {#if data.accountLocks && data.accountLocks.length > 0}
        {#each data.accountLocks as lock, id}
        <!-- Let's show just the normal stakes, and the boosted ones. The stakes having a boostedPointer are obsolete stakes, so we won't show them -->
          {#if lock.boostedPointer == ""}
            <div class="{lock.ejected ? 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px opacity-60' : 'flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px'}">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Your total staked DOUGH</div>
                <div class="flex items-center"><div class="font-thin mr-2">Staking ends: </div><span>{calculateStakingEnds(lock).toLocaleDateString()}</span></div>
                </div>
                <div class="flex nowrap items-center p-1 justify-between mt-2">
                  <div class="grid grid-flow-col grid-cols-1 grid-rows-2">
                    <div class="sc-iybRtq gjVeBU">
                      <div class="font-24px">{formatFiat(toNum(lock.amount), ',', '.', '')}</div>
                      <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                      <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
                    </div>
                    <div class="sc-iybRtq gjVeBU float-left">
                      <div class="font-24px">{formatFiat(calculateVeDough(lock.amount, lock.lockDuration / 60), ',', '.', '')}</div>
                      <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                      <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
                    </div>
                  </div>
                  {#if (lock.lockDuration / 60) != 36}
                    {#if !lock.boosted}
                    <div on:click={() => {boostToMax(id)}} class="flex items-center cardbordergradient -mr-2 pointer"><div class="flex items-center p-2"><div class="mr-8px">Boost to Max</div> <img class="w-30px h-30px" src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png" alt="ETH"></div></div>
                    {:else}
                      <div class="flex items-center cardbordergradient -mr-2 pointer opacity-30"><div class="flex items-center p-2"><div class="mr-8px">Already Boosted</div> <img class="w-30px h-30px" src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png" alt="ETH"></div></div>
                    {/if}
                  {/if}
                </div>
                <div class="mt-2 flex justify-start opacity-30 pointer"><span>{getLockStatus(lock)}</span></div>
                {#if !lock.withdrawn && !lock.ejected}
                  {#if didLockExpired(lock)}
                    <div on:click={() => {unstakeDOUGH(id, toNum(lock.amount))}} class="mt-2 flex justify-end pointer"><span>Unstake</span></div>
                  {:else}
                  <div class="mt-2 flex justify-end opacity-30 pointer"><span>Unstake</span></div> 
                  {/if}                
                {/if}
            </div>
          {/if}
        {/each}
      {:else} 
      Insert placeholder
      No locks 
      {/if}

    </div>
    <!-- END YOUR STAKING -->
        <!-- PAST REWARDS -->
        <div class="flex flex-col items-center w-full pb-6 bg-lightyellow rounded-16 mt-6">
          <div class="font-huge text-center mt-6">Rewards History</div>
          {#if data.rewards && data.rewards.length > 0}
            {#each data.rewards as reward, id}
              {#if reward.type != "distributed"}
              <div on:click={() => { reward.type == "slashed" ? modalinfo.open() : null }} class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">{new Date(reward.timestamp * 1000).toDateString()}</div>
                  <a class="" href="https://rinkeby.etherscan.io/tx/{reward.id}" target="_blank"><img width="20px" height="20px" src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg" alt="external link icon"></a>
                  </div>
                  <div class="flex nowrap items-center justify-between p-1">
                    <span class="sc-iybRtq gjVeBU">
                      <div class="font-24px">{formatFiat(toNum(reward.amount), ',', '.', '')}</div>
                      <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="rewardspie token" />
                    </span>
                    <div class="flex items-center justify-between">
                      <img class="h-auto w-24px mx-5px" src={reward.type == "claimed" ? images.claimed : images.slashed} alt="clamed icon" />
                      <span>{reward.type}</span>
                    </div>      
                  </div>   
              </div>
              {/if}              
            {/each}
           {:else}
           Insert placeholder
           {/if}
        </div>
        <!-- END PAST REWARDS -->
</div>


<div class="flex flex-col w-full m-0  lg:w-49pc md:ml-1pc">
  <!-- STAKING FORM -->
  {#if !isLoading}
  <div class="flex flex-col items-center w-full  cardbordergradient p-1px bg-lightgrey">
  <div class="font-huge text-center mt-6">DOUGH Staking</div>
    <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from border rounded-20px border-grey p-16px">
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

    <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from border rounded-20px border-grey p-16px mt-4">
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Stake Duration (6 to 36 months)</div>
        <div
          class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin"
          style="display: inline; cursor: pointer;"
        >
        </div>
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
        />
          <div on:click={() => {stakeDuration = 36;}} class="pointer flex items-center cardbordergradient"><div class="flex items-center p-2"><div class=" mr-8px">3 Years</div> <img class="w-30px h-30px" src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png" alt="ETH"></div></div>
      </div>
    </div>

    <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from border rounded-20px border-grey p-16px mt-4">
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
        />
      </div>
    </div>

    {#if data.accountDepositTokenBalance.eq(0)}
      <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-4">You don't own tokens </button>  
    {:else}
      {#if stakeAmount }
        {#if toBN(stakeAmount).isGreaterThan(data.accountDepositTokenBalance)}
          <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Balance too low</button>
        {:else if toBN(stakeAmount).isGreaterThan(data.accountDepositTokenAllowance)}
          <button on:click={approveToken} class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Approve</button>
        {:else}
          {#if stakeDuration && stakeDuration > 5 && stakeDuration < 37}
            <button on:click={stakeDOUGH} class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Stake</button>
          {:else}
            <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Duration not correct</button>
          {/if}
        {/if}
      {:else}
        <button disabled class="pointer btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6">Enter an amount</button>  
      {/if}
    {/if}
 <!-- END STAKING FORM -->
  </div>

{:else}
  Loading...
{/if}
</div>


</div>
</div>