<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../components/helpers.js';
  import { toNum, claim , getParticipations} from '../helpers/staking.js';
  import images from '../config/images.json';
  import smartcontracts from '../config/smartcontracts.json';
  import Modal from '../components/elements/Modal.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let data;
  export let eth;

  let participations = getParticipations();
  let staker = {participation: 0};
  let modalinfo;

  $: if (eth.address) {
    let founded = participations.find(staker => staker.address.toLowerCase() == eth.address.toLowerCase());
    staker = founded ? founded : staker;
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
</script>

<Modal title="You can't claim yet" backgroundColor="#f3f3f3" bind:this={modalinfo}>
  <div slot="content" class="font-thin text-center hidescrollbar">
    <p class="pb-2">Here's what you have to do:</p>

    <div class="text-center mx-auto w-auto rounded-xl pointer mt-4 w-200px" style="border: 1px solid #FFAC32;">
      <a href="https://snapshot.org/#/piedao" target="_blank">Snapshot/PieDAO ⚡</a>
    </div>     
    <p class="pt-2 mb-8">1. Vote on the current proposals<br />to be eligible to claim rewards</p>
   
    <div class="text-center mx-auto">
      <img
      class="w-80px h-80px mx-auto"
      src={images.rewardsPie}
      alt="ETH"
    /> 
    </div>    
    <p class="pt-2 mb-4">2. Claim your rewards!<br />Rewards are calculated and available<br />for claiming at the start of every calendar month.</p>

    <div class="text-center mx-auto">
      <img
      class=" mx-auto pt-4 token-icon"
      src={images.simulator_sword}
      alt="ETH"
    /> 
    </div>    
    <p class="pt-2 pb-2">3. Remember, rewards unclaimed for 3 months<br />are going  to be slashed and redestributed to active participants</p>
  </div>
</Modal>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Your Total staked DOUGH</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        <div class="font-24px">{eth.address ? formatFiat(toNum(data.accountTokenBalance), ',', '.', '') : 0}</div>
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
        <div class="font-24px">
          {eth.address ? formatFiat(toNum(data.accountVeTokenBalance), ',', '.', '') : 0}
        </div>
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
    </div>
    <div class="flex nowrap items-center p-1">
      <div class="flex-1">
        <span class="sc-iybRtq gjVeBU">
          <div class="font-24px">
            {eth.address ? formatFiat(toNum(data.accountWithdrawableRewards), ',', '.', '') : 0}
          </div>
          <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">SLICE</span>
        </span>        
      </div>
      {#if eth.address}
      <button 
      class="flex items-center bg-black rounded-xl -mr-2 pointer px-4 py-2 text-white"
      on:click={() => {
        if(!data.accountWithdrawableRewards.eq(0) && staker.participation == 1) {
          claim(eth).then(updated_data => {
          data = updated_data;
          data = data;

          dispatch('update', {
            data: data,
          });          
        }).catch(error => {
          console.error(error);
        });
        } else {
          modalinfo.open()
        }
      }}
      > Claim</button>
    {/if}
    </div>
  </div>
  <div class="w-full flex px-6">
    <div class="w-1/2 flex flex-col flex-shrink mr-2 mt-4 mb-6 rounded-20px bg-white p-16px"
    >
      <div class="flex items-center justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Average Locking Period</div>
      </div>
      <div class="flex nowrap items-center p-1">
        <div class="flex-1">
          <span class="sc-iybRtq gjVeBU">
            <div class="font-24px">
              {eth.address ? data.accountAverageDuration : "0"} Months
            </div>
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
            <div class="font-24px">
              {eth.address ? data.accountVotingPower : 0} %
            </div>
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