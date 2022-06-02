<script>
    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n';
    import { formatFiat } from '../../components/helpers.js';
    import images from '../../config/images.json';
    import smartcontracts from '../../config/smartcontracts.json';
    import Modal from '../../components/elements/Modal.svelte';
    import displayNotification from '../../notifications';
    import InfoModal from '../../components/modals/infoModal.svelte';
    import ClaimModal from '../../components/elements/ClaimModal.svelte';
    import { stakingData } from '../../stores/eth/writables.js';
    import { eth, balances, balanceKey } from '../../stores/eth.js';
    import isEmpty from 'lodash/isEmpty';
    import get from 'lodash/get';
    import { subscribeToBalance, amountFormatter } from "../helpers"
    import { compound, toNum } from '../../helpers/staking.js';
    import BigNumber from "bignumber.js";
    import sliceDoughData from "../../config/slice-dough.json";
    
    let claimModal;
    let compoundModal;
    let votingInfos = "";
    let votingImage = "";
    let votingClass = "";
    let modal;
    let modal_content_key;
    let voteKeyword;
    let isLoading = true;
    let isCompounding = false;
    let buttonText = "Compound Now";
    let sliceInWallet = new BigNumber(0);
    let sliceAmount = new BigNumber(0);
    let stakeMax = false;
    let sliceDoughRate = sliceDoughData[0]["SLICE/DOUGH 3days avg"];
    let compoundAmount = {
        label: '',
        bn: new BigNumber(0),
    };
    let nextRate;
    let nextCompoundWindow;
    
    $: if($stakingData && !isEmpty($stakingData) && $stakingData.address) {
        isLoading = false;
        if($stakingData.votes) {
            if($stakingData.votes.length) {
                votingImage = "check-mark-button";
                votingInfos = "You voted this month";
                votingClass = "text-green";
                voteKeyword = "you_voted";
            } else {
                if($stakingData.proposals) {
                    if($stakingData.proposals.length == 0) {
                        votingInfos = "No open votes"; 
                        votingImage = "hourglass-pending";
                        votingClass = "text-black";
                        voteKeyword = "no_votes";
                    } else {
                        // filtering out the ejected/withdrawn lock...
                        let oldestValidLock = $stakingData.accountLocks.filter(lock => {
                            if(!lock.ejected && !lock.withdrawn) {
                                return lock;
                            }
                        }).reverse();
                        // and getting the oldest one, by reversing the DESC order...
                        oldestValidLock = get(oldestValidLock, 0);           
                        // finally checking if the user can vote on snapshot, or if the
                        // proposal is older than his oldest lock...
                        if($stakingData.proposals.length == 0) {
                            votingImage = "warning";
                            votingInfos = "No active proposals to vote on";
                            votingClass = "text-red";
                            voteKeyword = "cannot_votes";
                        } else {
                            let proposalTimestamp = get($stakingData, 'proposals[0].block.timestamp', false);
                            
                            if(proposalTimestamp) {
                                if(oldestValidLock && proposalTimestamp < Number(oldestValidLock.lockedAt)) {
                                    votingImage = "warning";
                                    votingInfos = "You can't vote just yet";
                                    votingClass = "text-red";
                                    voteKeyword = "cannot_votes";
                                } else {
                                    votingImage = "warning";
                                    votingInfos = "You need to vote";
                                    votingClass = "text-yellow";
                                    voteKeyword = "need_to_vote";
                                } 
                            } else {
                                votingImage = "warning";
                                votingInfos = "Snapshot error";
                                votingClass = "text-red";
                                voteKeyword = "snapshot_error";   
                            }
                        }
                    }
                }
            }
        }
    }

    $: (async () => {
        if ($eth.address)  {
            await subscribeToBalance(smartcontracts.reward, $eth.address, true);
        }
    })();



    $: if($eth.address && $stakingData && $balances) {
        sliceCalc();
    }

    // Calculate all the slices that belong to address, both from claimable rewards & from user's wallet
    function sliceCalc() {
        const key = balanceKey(smartcontracts.reward, $eth.address);
        if(!$balances[key]) return;

        sliceInWallet = $balances[key].multipliedBy(10 ** 18);
        const sliceReward = $stakingData.accountWithdrawableRewards;

        if (sliceInWallet && sliceInWallet.gt(0) && sliceReward.gt(0)) {
            sliceAmount = sliceInWallet.plus(sliceReward);
            return;
        }

        if (sliceInWallet && sliceInWallet.gt(0)) {
            sliceAmount = sliceInWallet;
            return;
        }

        if (sliceReward && sliceReward.gt(0)) {
            sliceAmount = sliceReward;
            return;
        }
    }
    
    function openModal(content_key) {
        modal_content_key = content_key;
        modal.open();
    }
    
    const addToken = () => {
        ethereum.sendAsync(
        {
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: smartcontracts.reward,
                    symbol: 'SLICE',
                    decimals: 18,
                    image: images.rewardsPie,
                },
            },
            id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
            if (added) {
                displayNotification({
                    message: 'The SLICE token has been added to your Metamask!',
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

    function onAmountChange() {
        compoundAmount.bn = new BigNumber(compoundAmount.label).multipliedBy(10**18);
        if (compoundAmount.bn.gt(sliceInWallet)) {
            buttonText = "Claim & Compound"
        } else {
            buttonText = "Compound Now"
        }
    }

    async function compoundSlice() {
      isCompounding = true;
      buttonText = 'Compounding';

      let interval = setInterval(() => {
        let occurrences = buttonText.split('.').length - 1;

        if (occurrences < 3) {
          buttonText += '.';
        } else {
          buttonText = 'Compounding';
        }
      }, 1000);

      const shouldClaim = compoundAmount.bn.isGreaterThan(sliceInWallet);
      compound($eth, compoundAmount.bn.dividedBy(10**18).toFixed(4, 1), shouldClaim).then(() => {
          clearInterval(interval);
          buttonText = "Compounded!";
          isCompounding = false;
        }).catch(error => {
          clearInterval(interval);
          buttonText = "Compound now";
          console.error(error);
          isCompounding = false;
        });
    }

    onMount(async () => {
        const res = await fetch("https://raw.githubusercontent.com/pie-dao/shared-metadata/main/slice-rate.json");
        const data = await res.json();
        nextRate = data.nextRate;
        nextCompoundWindow = data.nextCompoundWindow;
    })
</script>

<Modal title=" " backgroundColor="#f3f3f3" bind:this={modal}>
    <span slot="content">
        <InfoModal description_key={modal_content_key}/>
    </span>
</Modal>

<Modal title="Compound SLICE" backgroundColor="#f3f3f3" bind:this={compoundModal}>
    <div slot="content" class="font-thin">
      <div class="flex flex-col content-center align-center items-center justify-center">
        <div class="w-full flex-row text-center">
            <p>You will send your SLICE to the PieDAO Treasury and then deposit veDOUGH into your account two weeks after the distribution date{nextCompoundWindow ? `: ${nextCompoundWindow}.` : "."}</p>
            {#if isLoading && $eth.address}
                <div class="mr-2">Loading...</div>
            {:else}
            <div class="flex w-full items-center space-between">
                <div class="flex flex-row w-full gap-x-4">
                    <div class="flex flex-col nowrap w-full mt-6 swap-from rounded-20px bg-white p-16px">
                        <h3 class="font-bold text-left">Claimable Rewards</h3>
                        <div class="flex items-center justify-between">
                            <span class="text-sm lg:text-md font-bold">{$eth.address && amountFormatter({ amount: $stakingData.accountWithdrawableRewards.dividedBy(10**18), displayDecimals: 4 })}</span>
                            <div class="flex items-center">
                                <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
                                <span class="sc-kXeGPI jeVIZw token-symbol-container font-bold text-sm lg:text-md">SLICE</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col nowrap w-full  mt-6 swap-from rounded-20px bg-white p-16px">
                        <h3 class="text-left font-bold">Wallet</h3>
                        <div class="flex items-center justify-between">
                            <span class="text-sm lg:text-md font-bold">{$eth.address && amountFormatter({ amount: sliceInWallet.dividedBy(10**18), displayDecimals: 4 })}</span>
                            <div class="flex items-center">
                                <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
                                <span class="sc-kXeGPI jeVIZw token-symbol-container font-bold text-sm lg:text-md">SLICE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
            <div class="flex flex-col nowrap w-full mt-4 border rounded-20px border-grey p-16px" class:input-invalid={compoundAmount.bn.gt(sliceAmount)}>
                <div class="flex justify-between">
                    <div class="flex nowrap items-center p-1 font-thin">Amount to Compound</div>
                    <label class="flex items-center justify-center font-bold">
                        <input type="checkbox" class="toggle-input text-pink w-4 h-4 mr-2 focus:ring-pink focus:ring-opacity-25 border border-gray-300 rounded" bind:checked={stakeMax} on:change={() => {
                            if (stakeMax) {
                                compoundAmount.bn = sliceAmount;
                                compoundAmount.label = sliceAmount.dividedBy(10**18).toFixed(4, 1);
                            } else {
                                compoundAmount.bn = new BigNumber(0);
                                compoundAmount.label = '';
                            }
                        }} />
                        Stake all my SLICEs
                    </label>
                </div>
                <div class="flex justify-between items-center gap-x-3">
                    <input class="swap-input-from" style="background-color: #f3f3f3" on:focus={() => {compoundAmount.label = compoundAmount.label === 0 ? '' : compoundAmount.label}} on:keyup={onAmountChange} bind:value={compoundAmount.label} inputmode="decimal" title="Token Amount" autocomplete="off" autocorrect="off" type="number" pattern="^[0-9]*[.]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
                    <div class="flex">
                        <img class="h-auto w-24px mr-5px" src={images.rewardsPie} alt="slice token" />
                        <span class="sc-kXeGPI jeVIZw token-symbol-container font-bold">SLICE</span>
                    </div>
                </div>
            </div>
        <div class="w-full flex flex-col content-center align-center items-center justify-center">
          <button
          class="flex items-center bg-pink rounded-xl pointer px-4 py-2 my-4 text-white"
          disabled={compoundAmount.bn.gt(sliceAmount)}
          class:opacity-50={compoundAmount.bn.gt(sliceAmount)}
          class:cursor-not-allowed={compoundAmount.bn.gt(sliceAmount)}
          on:click={() => {
            compoundSlice();
          }}
          >
          {buttonText}
          </button>
          <div class="mt-2">
            {#if nextRate}
                <p class="text-sm italic">The conversion rate during the latest distribution was: {nextRate} SLICE/DOUGH.</p>
            {/if}
            <strong>The DAO will send additional veDOUGH as a lump sum to cover the gas spent on the 2 transactions to claim and send the SLICE.</strong> 
          </div>
        </div>
      </div>
    </div>
</Modal>
<ClaimModal bind:this={claimModal}/>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
    <div class="font-huge text-center mt-6">Summary</div>
    <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
        <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Your Total staked DOUGH</div>
        </div>
        <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
                {#if isLoading && $eth.address}
                <div class="mr-2">Loading...</div>
                {:else}
                <div class="font-24px">{$eth.address ? formatFiat(toNum($stakingData.accountTokenBalance), ',', '.', '') : 0}</div>
                {/if}
                <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
                <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
            </span>
        </div>
    </div>
    <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
        <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">Your Total Staked veDOUGH</div>
        </div>
        <div class="flex nowrap items-center p-1">
            <span class="sc-iybRtq gjVeBU">
                {#if isLoading && $eth.address}
                <div class="mr-2">Loading...</div>
                {:else}
                <div class="font-24px">
                    {$eth.address ? formatFiat(toNum($stakingData.accountVeTokenBalance), ',', '.', '') : 0}
                </div>
                {/if}
                <img class="h-auto w-24px mx-5px" src={images.veDough} alt="dough token" />
                <span class="sc-kXeGPI jeVIZw token-symbol-container">veDOUGH</span>
            </span>
        </div>
    </div>
    <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Claimable Rewards</div>
        {#if $eth.address}
        <div on:click={() => openModal('staking.claim.vote.' + voteKeyword)} class={"flex nowrap intems-center p-1 pointer text-xs " + votingClass}>
            {#if votingInfos}
                <img class="summary-icon" src={images[votingImage]} alt=""/>
            {/if}
            <span>{votingInfos}</span>
        </div>
    {/if}
</div>
<div class="flex flex-col md:flex-row nowrap items-center p-1">
    <div class="flex w-full flex-row">
        <span class="sc-iybRtq gjVeBU">
            {#if isLoading && $eth.address}
            <div class="mr-2">Loading...</div>
            {:else}          
            <div class="font-24px">
                {$eth.address ? formatFiat(toNum($stakingData.accountWithdrawableRewards), ',', '.', '') : 0}
            </div>
            {/if}
            <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
            <span class="sc-kXeGPI jeVIZw token-symbol-container">SLICE</span>
        </span>
    </div>
    {#if $eth.address && sliceAmount.gt(0)}
    <div class="flex w-full flex-row pt-4 md:pt-0">
      <button 
          disabled={isLoading || sliceAmount.eq(0)}
          class="flex items-center bg-pink rounded-xl pointer px-4 py-2 text-white mr-4"
          on:click={() => compoundModal.open()}
      >Compound</button>
      <button 
      disabled={isLoading}
      class="flex items-center bg-black rounded-xl -mr-2 pointer px-4 py-2 text-white"
      on:click={() => {
          if($eth.address) {
              claimModal.showModal($stakingData);
          }
      }}
      > Claim</button>
    </div>
    {/if}
</div>
</div>
<div class="w-full flex px-4 md:px-6">
    <div class="w-1/2 flex flex-col flex-shrink mr-2 mt-4 mb-6 rounded-20px bg-white p-16px"
    >
    <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Average Locking Period</div>
    </div>
    <div class="flex nowrap items-center p-1">
        <div class="flex-1">
            <span class="sc-iybRtq gjVeBU">
                {#if isLoading && $eth.address}
                <div class="mr-2">Loading...</div>
                {:else}            
                <div class="font-24px">
                    {$eth.address ? $stakingData.accountAverageDuration : "0"} Months
                </div>
                {/if}
            </span>        
        </div>
    </div>
</div>
<div class="w-1/2 flex flex-col flex-shrink ml-2 mt-4 mb-4 rounded-20px bg-white p-16px"
>
<div class="flex items-center justify-between">
    <div class="flex nowrap intems-center p-1 font-thin">Your Voting Power</div>
</div>
<div class="flex nowrap items-center p-1">
    <div class="flex-1">
        <span class="sc-iybRtq gjVeBU">
            {#if isLoading && $eth.address}
            <div class="mr-2">Loading...</div>
            {:else}             
            <div class="font-24px">
                {$eth.address ? $stakingData.accountVotingPower : 0} %
            </div>
            {/if}
        </span>        
    </div>
</div>
</div>    
</div> 
<button
on:click={() => addToken()}
class="text-center pointer mx-auto object-bottom mb-4 font-thin"
>
🦊 Add SLICE to MetaMask
</button> 
</div>