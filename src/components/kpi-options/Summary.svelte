<script>
  import { _ } from 'svelte-i18n';
  import { formatFiat } from '../../components/helpers.js';
  import { toNum, fetchStakingStats } from '../../helpers/staking.js';
  import images from '../../config/images.json';
  import smartcontracts from '../../config/smartcontracts.json';
  import displayNotification from '../../notifications';
  import { eth, connectWeb3 } from '../../stores/eth.js';
  import BigNumber from 'bignumber.js';
  import { ethers } from 'ethers';
  import DoughABI from '../../abis/DoughABI.json';
  import WkpiJson from '../../config/rewards/wkpi.json';
  import get from 'lodash/get';

  let isLoadingTotal = true;
  let isLoading = true;
  let currentAddress;
  let doughContract;

  $: kpiOptionsData = {
    totalDistributedRewards: BigNumber(0),
    estimatedKpiOptions: BigNumber(0),
    claimableKpiOptions: BigNumber(0)
  };

  $: if($eth.provider) {
    initDistributedRewards();
  }

  async function initDistributedRewards() {
    if(!doughContract) {
      isLoadingTotal = true;

      doughContract = new ethers.Contract(
        smartcontracts.dough,
        DoughABI,
        $eth.provider,
      );

      kpiOptionsData.totalDistributedRewards = await doughContract.balanceOf(smartcontracts.kpi_options);
      isLoadingTotal = false;
    }
  }

  $: if($eth.address) {
    if(currentAddress != $eth.address) {
      currentAddress = $eth.address;
      init();
    }
  }

  async function claim() {
    alert("to be completed");
  }

  async function init() {
    isLoading = true;
    
    let claimAddress = get(WkpiJson.claims, $eth.address);
    
    if(claimAddress) {
      kpiOptionsData.claimableKpiOptions = BigNumber(claimAddress.amount);
      kpiOptionsData.estimatedKpiOptions = await calculateKpiOptions(kpiOptionsData.claimableKpiOptions);
    } else {
      kpiOptionsData.claimableKpiOptions = BigNumber(0);
      kpiOptionsData.estimatedKpiOptions = BigNumber(0);
    }

    isLoading = false;
  }

  const addToken = () => {
    ethereum.sendAsync(
      {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: smartcontracts.wkpi,
            symbol: 'wDOUGH-KPI',
            decimals: 18,
            // image: images.rewardsPie,
          },
        },
        id: Math.round(Math.random() * 100000),
      },
      (err, added) => {
        if (added) {
          displayNotification({
            message: 'The wDOUGH-KPI token has been added to your Metamask!',
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

  async function calculateKpiOptions(claimableKpiOptions) {
    const doughPayouts = [
      { threshold: 15000000, value: 0.3 },
      { threshold: 10000000, value: 0.2 },
      { threshold: 7500000, value: 0.1 },
    ];

    // fetching updated staking stats...
    const stakingStats = await fetchStakingStats($eth.provider, 1);
    // taking thte stakedDough amount from stats...
    const stakedDough = toNum(stakingStats.totalStakedDough);
    // finding the payout by its threshold...
    const payout = doughPayouts.find(
      (_payout) => Number(stakedDough.toString()) >= _payout.threshold,
    );
    // finally multiplying the claimableKpiOptions by the payout value...
    const kpiReward = claimableKpiOptions.times(payout.value);
    // and returning the calculated kpiReward for current address...
    return kpiReward;
  }  
</script>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-6 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Total Distributed Rewards</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        {#if isLoadingTotal && $eth.provider}
          <div class="mr-2">Loading...</div>
        {:else}
          <div class="font-24px">{$eth.provider ? formatFiat(toNum(kpiOptionsData.totalDistributedRewards), ',', '.', '') : 0}</div>
        {/if}
        <img class="h-auto w-24px mx-5px" src={images.doughtoken} alt="dough token" />
        <span class="sc-kXeGPI jeVIZw token-symbol-container">DOUGH</span>
      </span>
    </div>
  </div>
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Your Estimated UMA KPI Options</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <span class="sc-iybRtq gjVeBU">
        {#if isLoading && $eth.address}
          <div class="mr-2">Loading...</div>
        {:else}
          <div class="font-24px">
            {$eth.address ? formatFiat(toNum(kpiOptionsData.estimatedKpiOptions), ',', '.', '') : 0}
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
      <div class="flex nowrap intems-center p-1 font-thin">Your Claimable KPI Tokens</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <div class="flex-1">
        <span class="sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="mr-2">Loading...</div>
          {:else}          
            <div class="font-24px">
              {$eth.address ? formatFiat(toNum(kpiOptionsData.claimableKpiOptions), ',', '.', '') : 0}
            </div>
          {/if}
          <!-- <img class="h-auto w-24px mx-5px" src={images.rewardsPie} alt="dough token" /> -->
          <span class="sc-kXeGPI jeVIZw token-symbol-container">WKPI</span>
        </span>
      </div>
    </div>
  </div>

  {#if $eth.address}
    {#if !kpiOptionsData.claimableKpiOptions.eq(0)}
      <div class="flow flow-col">
        <button 
        disabled={isLoading}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          claim()
        }}
      >Claim</button> 
      <button 
        disabled={isLoading}
        class="pointer btn stake-button rounded-20px py-15px px-22px mt-6"
        on:click={() => {
          alert("this should bring to uma kpi page, to allow user to redeem...");
        }}
      >Redeem</button> 
      </div>      
    {/if}
  {:else}
    <button
      on:click={() => connectWeb3()}
      class="pointer btn clear stake-button rounded-20px py-15px px-22px mt-6"
      >Connect a Wallet</button
    >   
  {/if}
  <button
    on:click={() => addToken()}
    class="text-center pointer mx-auto object-bottom mb-4 mt-4 font-thin"
  >
    🦊 Add wDOUGH-KPI to MetaMask
  </button> 
</div>