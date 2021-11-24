<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../../components/helpers.js';
  import { environment } from '../../stores/eth/connection.js';
  import { toNum } from '../../helpers/staking.js';
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import Modal from '../../components/elements/Modal.svelte';
  import displayNotification from '../../notifications';
  import InfoModal from '../../components/modals/infoModal.svelte';
  import ClaimModal from '../../components/elements/ClaimModal.svelte';
  import { stakingData } from '../../stores/eth/writables.js';
  import { eth } from '../../stores/eth.js';
  import isEmpty from 'lodash/isEmpty';
  import get from 'lodash/get';

  let claimModal;
  let votingInfos = "";
  let votingImage = "";
  let votingClass = "";
  let modal;
  let modal_content_key;
  let voteKeyword;
  let isLoading = true;

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
              if(oldestValidLock && $stakingData.proposals[0].block.timestamp < Number(oldestValidLock.lockedAt)) {
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
            }
          }
        }
      }
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
            address: smartcontracts[environment].reward,
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
</script>

<Modal title=" " backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <InfoModal description_key={modal_content_key}/>
  </span>
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
  <div
    class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px"
  >
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Claimable Rewards</div>
      {#if $eth.address}
        <div 
        on:click={() => openModal('staking.claim.vote.' + voteKeyword)}
        class={"flex nowrap intems-center p-1 pointer text-xs " + votingClass}>
          {#if votingInfos}
            <img class="summary-icon" src={images[votingImage]} alt=""/>
          {/if}
          <span>{votingInfos}</span>
        </div>
      {/if}
    </div>
    <div class="flex nowrap items-center p-1">
      <div class="flex-1">
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
      {#if $eth.address}
      <button 
      disabled={isLoading}
      class="flex items-center bg-black rounded-xl -mr-2 pointer px-4 py-2 text-white"
      on:click={() => {
        if($eth.address) {
          claimModal.showModal($stakingData);
        }
      }}
      > Claim</button>
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