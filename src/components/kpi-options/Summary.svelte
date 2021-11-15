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
  import MerkleTreeDistributorABI from '../../abis/MerkleTreeDistributorABI.json';
  import WkpiJson from '../../config/rewards/wkpi.json';
  import get from 'lodash/get';

  let merkleTreeDistributor;

  let isLoadingTotal = true;
  let isLoading = true;
  let currentAddress;

  $: kpiOptionsData = {
    totalDistributedRewards: BigNumber(0),
    estimatedKpiOptions: BigNumber(0),
    claimableKpiOptions: BigNumber(0)
  };

  $: if($eth.provider) {
    kpiOptionsData.totalDistributedRewards = WkpiJson.totalRewardsDistributed;
    isLoadingTotal = false;
  }

  $: if($eth.address) {
    if(currentAddress != $eth.address) {
      currentAddress = $eth.address;
      init();
    }
  }

  async function init() {
    isLoading = true;
    
    merkleTreeDistributor = new ethers.Contract(
    smartcontracts.merkleTreeDistributor,
    MerkleTreeDistributorABI,
    $eth.signer || $eth.provider,
  );

    let claimAddress = get(WkpiJson.claims, $eth.address);

    let isClaimed = await merkleTreeDistributor["isClaimed(uint256,uint256)"](
      ethers.BigNumber.from(claimAddress.windowIndex), 
      ethers.BigNumber.from(claimAddress.accountIndex)
    );
    
    if(claimAddress && !isClaimed) {
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
      { threshold: 15000000, value: 0.5 },
      { threshold: 10000000, value: 0.2 },
      { threshold: 7500000, value: 0.1 },
    ];

    // fetching updated staking stats...
    const stakingStats = await fetchStakingStats($eth.provider, 1);
    // taking the stakedDough amount from stats...
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

  export function retrieveLeaf(address) {
    const participations = WkpiJson.claims;
    return participations[ethers.utils.getAddress(address.toLowerCase())];
  }

  export function prepareProofs() {
    if (!$eth.address) return;

    const leaf = retrieveLeaf($eth.address);

    /* eslint-disable consistent-return */
    return {
      leaf: leaf,
      valid: !!leaf,
      proof: leaf ? leaf.proof : null,
    };
    /* eslint-enable consistent-return */
  }

  export async function claim() {
    const proof = prepareProofs($eth);
    console.log('proof', proof);

    try {
      const leaf = retrieveLeaf($eth.address);

      if(proof.leaf) {
        const params = {
          windowIndex: proof.leaf.windowIndex,
          amount: ethers.BigNumber.from(proof.leaf.amount),
          accountIndex: proof.leaf.accountIndex,
          account: ethers.utils.getAddress($eth.address.toLowerCase()),
          merkleProof: proof.leaf.proof
        };
  
        const { emitter } = displayNotification(
          await merkleTreeDistributor["claim((uint256,uint256,uint256,address,bytes32[]))"](params)
        );
  
        emitter.on('txConfirmed', async () => {
          const subscription = subject('blockNumber').subscribe({
            next: async () => {
              displayNotification({
                autoDismiss: 15000,
                message: 'WKPI-DOUGH has been claimed!',
                type: 'success',
              });
  
              subscription.unsubscribe();
              
              // update the kpiOptionsData object...
              init();
            },
          });
        });        
      } else {
        displayNotification({
        autoDismiss: 15000,
        message: 'cannot claim, address not valid in merkleTree',
        type: 'error',
      });
      }
    } catch (error) {
      console.error(error);

      displayNotification({
        autoDismiss: 15000,
        message: 'Sorry, an error occurred while claiming your rewards. Please try again later.',
        type: 'error',
      });
    }
  }
</script>

<div class="flex flex-col items-center w-full p-1px bg-lightgrey rounded-16">
  <div class="font-huge text-center mt-6">Summary</div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center p-1 font-thin">Total Distributed KPI Options</div>
    </div>
    <div class="flex nowrap items-center md:items-left p-1">
      <div class="flex-1">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoadingTotal && $eth.address}
            <div class="md:mr-2">Loading...</div>
          {:else}          
            <div class="font-24px">
              {$eth.address ? formatFiat(toNum(kpiOptionsData.totalDistributedRewards), ',', '.', '') : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-kpi</span>
        </span>
      </div>
    </div>
  </div>  
  
  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center text-center p-1 font-thin">Your Claimable KPI Options</div>
    </div>
    <div class="flex nowrap items-center md:items-left p-1">
      <div class="flex-1">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="md:mr-2">Loading...</div>
          {:else}          
            <div class="font-24px">
              {$eth.address ? formatFiat(toNum(kpiOptionsData.claimableKpiOptions), ',', '.', '') : 0}
            </div>
          {/if}
          <img class="h-auto w-24px mx-5px" src={images.wkpi} alt="dough token" />
          <span class="sc-kXeGPI jeVIZw token-symbol-container">wDOUGH-kpi</span>
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col nowrap w-92pc mx-4pc mt-4 swap-from rounded-20px bg-white p-16px">
    <div class="flex items-center justify-between">
      <div class="flex-1 md:flex nowrap intems-center p-1 font-thin">Your Estimated Payout</div>
    </div>
    <div class="flex nowrap items-center md:items-left p-1">
      <div class="flex-1">
        <span class="flex-col md:flex-row sc-iybRtq gjVeBU">
          {#if isLoading && $eth.address}
            <div class="md:mr-2">Loading...</div>
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
      <!-- <a
        href="https://claim.umaproject.org/"
        target="_blank"
        class="pointer btn stake-button rounded-20px py-21px px-30px mt-6"
      >Redeem</a>  -->
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