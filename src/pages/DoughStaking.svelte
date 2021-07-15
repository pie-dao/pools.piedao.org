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

  const toNum = (num) =>
    BigNumber(num.toString())
      .dividedBy(10 ** 18)
      .toFixed(2);

  const toBN = (num) =>
    BigNumber(num.toString())
      .multipliedBy(10 ** 18);


  
  // All the epochs where rewards are available.
  $: epochs = [];
  $: isLoading = true;  

  let data = {
    totalStaked: BigNumber(0),
    rewardTokenSupply: BigNumber(0),
    accountRewardTokenBalance: BigNumber(0), //amount of veDOUGH you have
    accountWithdrawableRewards: BigNumber(0), //amount is in reward Pie
    accountWithdrawnRewards: BigNumber(0),
    accountDepositTokenBalance: BigNumber(0),
    accountLocks: [],
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
    console.log("calculateStakingEnds", startDate.getMonth(), lockDuration);
    startDate.setMonth(startDate.getMonth() + lockDuration);
    return startDate;
  }

  function didLockExpired(lock) {
    let endDate = calculateStakingEnds(lock);
    let nowDate = new Date();
    return nowDate > endDate;
  }

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
    
    console.log('data', data);
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
      console.log("fetchStakingData", data);

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
      await fetchStakingData();
      console.log("fetchStakingData", data);   
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
      displayNotification({
        autoDismiss: 15000,
        message: error.message,
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

  async function stake() {
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
              console.log("fetchStakingData", data);
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

</script>

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
          <div class="flex nowrap intems-center p-1 font-thin">Your total staked DOUGH</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">{toNum(data.totalStaked)}</div>
              <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
            </span>
          </div>     
      </div>
      <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
        <div class="flex items-center justify-between">
          <div class="flex nowrap intems-center p-1 font-thin">Your total staked veDOUGH</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
              <div class="font-24px">{toNum(data.accountRewardTokenBalance)}</div>
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
              <div class="font-24px">{toNum(data.accountWithdrawableRewards)}</div>
              <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
              <span class="sc-kXeGPI jeVIZw token-symbol-container">RWRD</span>
            </span>
          </div>
          <button on:click={claim}> Claim now</button>  
      </div>
  </div>
  <!-- END SUMMARY -->
    <!-- YOUR STAKING -->
    <div class="flex flex-col items-center w-full pb-6 bg-lightblu rounded-16 mt-6">
      <div class="font-huge text-center mt-6">Your Staking</div>

        {#each data.accountLocks as lock, id}
        <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Your total staked DOUGH</div>
            <div class="flex items-center"><div class="font-thin mr-2">Staking ends: </div><span>{calculateStakingEnds(lock).toLocaleDateString()}</span></div>
            </div>
            <div class="flex nowrap items-center p-1 justify-between mt-2">
              <span class="sc-iybRtq gjVeBU">
                <div class="font-24px">{toNum(lock.amount)}</div>
                <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
              </span>
              <div class="flex items-center cardbordergradient -mr-2 pointer"><div class="flex items-center p-2"><div class="mr-8px">Restake 3 Years</div> <img class="w-30px h-30px" src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png" alt="ETH"></div></div>
            </div>
            {#if didLockExpired(lock)}
              <div on:click={() => {unstakeDOUGH(lock.lockId, toNum(lock.amount))}} class="mt-2 flex justify-end pointer"><span>Unstake</span></div>
            {:else}
            <div class="mt-2 flex justify-end opacity-30 pointer"><span>Unstake</span></div> 
            {/if}
        </div>
        {/each}

    </div>
    <!-- END YOUR STAKING -->
        <!-- PAST REWARDS -->
        <div class="flex flex-col items-center w-full pb-6 bg-lightyellow rounded-16 mt-6">
          <div class="font-huge text-center mt-6">Past Rewards</div>

            <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">July 2021</div>
                <a class="" href="#/something" target="_blank"><img width="20px" height="20px" src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg" alt="external link icon"></a>
                </div>
                <div class="flex nowrap items-center justify-between p-1">
                  <span class="sc-iybRtq gjVeBU">
                    <div class="font-24px">$ 87,093.10</div>
                    <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="rewardspie token" />
                  </span>
                  <div class="flex items-center justify-between">
                    <img class="h-auto w-24px mx-5px" src={images.claimed} alt="clamed icon" />
                    <span>Claimed</span>
                  </div>      
                </div>   
            </div>

            <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">July 2021</div>
                <a class="" href="#/something" target="_blank"><img width="20px" height="20px" src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg" alt="external link icon"></a>
                </div>
                <div class="flex nowrap items-center justify-between p-1">
                  <span class="sc-iybRtq gjVeBU">
                    <div class="font-24px">$ 87,093.10</div>
                    <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="rewardspie token" />
                  </span>
                  <div class="flex items-center justify-between">
                    <img class="h-auto w-24px mx-5px" src={images.claimed} alt="clamed icon" />
                    <span>Claimed</span>
                  </div>      
                </div>   
            </div>

            <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">July 2021</div>
                <a class="" href="#/something" target="_blank"><img width="20px" height="20px" src="https://raw.githubusercontent.com/pie-dao/brand/2deb3b9bb0c666a34dd715dce0f5a48e71ea3fe1/misc/external-link.svg" alt="external link icon"></a>
                </div>
                <div class="flex nowrap items-center justify-between p-1">
                  <span class="sc-iybRtq gjVeBU">
                    <div class="font-24px">$ 87,093.10</div>
                    <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="rewardspie token" />
                  </span>
                  <div class="flex items-center justify-between">
                    <img class="h-auto w-24px mx-5px" src={images.slashed} alt="clamed icon" />
                    <span>Slashed</span>
                  </div>      
                </div>   
            </div>
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
          <div
            on:click={() => {
              stakeDuration = 36;
            }}
          >
            <!-- 6 to 36 months -->
          </div>
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
          type="number"
          pattern="^[0-9]*[.]?[0-9]*$"
          placeholder="36"
          minlength="1"
          maxlength="79"
          spellcheck="false"
        />
          <div class="flex items-center cardbordergradient"><div class="flex items-center p-2"><div class=" mr-8px">3 Years</div> <img class="w-30px h-30px" src="https://raw.githubusercontent.com/pie-dao/brand/master/PIE%20Tokens/RewardPie.png" alt="ETH"></div></div>
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
            <button on:click={stake} class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Stake</button>
          {:else}
            <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6 border-white">Duration not correct</button>
          {/if}
        {/if}
      {:else}
        <button disabled class="btn clear stake-button rounded-20px p-15px w-92pc mx-4pc mt-6">Enter an amount</button>  
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