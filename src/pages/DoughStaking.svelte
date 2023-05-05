<script>
  import { eth, connectWeb3, balances, allowances, balanceKey, getAllowanceKey } from '../stores/eth.js';
  import { _ } from 'svelte-i18n';
  import images from '../config/images.json';
  import { formatToken, subscribeToBalance, subscribeToAllowance } from '../components/helpers.js';
  import { onDestroy } from 'svelte';
  import smartcontracts from '../config/smartcontracts.json';
  import displayNotification from '../notifications';
  import { stakingDataIntervalRunning, stakingData } from '../stores/eth/writables.js';
  import BigNumber from 'bignumber.js';
  import { toBN, stakeDOUGH, approveToken, calculateVeDough } from '../helpers/staking.js';

  import StakingRewards from '../components/staking/Rewards.svelte';
  import StakingPositions from '../components/staking/Positions.svelte';
  import StakingSummary from '../components/staking/Summary.svelte';
  import StakingStats from '../components/staking/Stats.svelte';
  import StakedModal from '../components/elements/StakedModal.svelte';
  import { fade } from 'svelte/transition'
  import HowTo from '../components/HowToGovernance.svelte';
  import HowToVideo from '../components/HowToGovernanceVideo.svelte';

  const views = [HowTo, HowToVideo]
  let viewportComponent = null
  let currentView = 0

  function toggleView() {
    currentView = currentView == 0 ? 1 : 0
  }

  function updateViewportComponent() {
    viewportComponent = views[currentView]
  }

  updateViewportComponent();

  let veDOUGH = 0;
  let allowanceKey;

  $: stakeButtonText = 'Stake DOUGH';
  $: isStaking = false;
  $: approveButtonText = 'Approve';
  $: isApproving = false;
  $: keyDoughBalance = false;

  $: getDoughBalance = (() => {
    if (!keyDoughBalance) return BigNumber(0);
    // saving the real-time value of dough amount into $stakingData object, so we can use it in other components/modals...
    $stakingData.accountDepositTokenBalance = $balances[keyDoughBalance]
      ? BigNumber($balances[keyDoughBalance].toString())
      : BigNumber(0);

    return $stakingData.accountDepositTokenBalance;
  })();
  let stakeAmount = {
    label: '',
    bn: BigNumber(0),
  };
  let stakeDuration = 36;
  let receiver;
  let currentAddress = null;
  let stakedModal;

  $: if ($eth.address) {
    subscribeToBalance(smartcontracts.dough, $eth.address);
    subscribeToAllowance(smartcontracts.dough, $eth.address, smartcontracts.doughStaking);

    keyDoughBalance = balanceKey(smartcontracts.dough, $eth.address);
    allowanceKey = getAllowanceKey(smartcontracts.dough, smartcontracts.doughStaking, $eth.address);

    // if address is first setup, or is changed...
    if (currentAddress !== $eth.address) {
      currentAddress = $eth.address;
      receiver = $eth.address;
      $stakingDataIntervalRunning = true;
    }
  }

  const addToken = () => {
    ethereum.sendAsync(
      {
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: smartcontracts.veDOUGH,
            symbol: 'veDOUGH',
            decimals: 18,
            image: images.veDough,
          },
        },
        id: Math.round(Math.random() * 100000),
      },
      (err, added) => {
        if (added) {
          displayNotification({
            message: 'The veDOUGH token has been added to your Metamask!',
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

  function calculateVeDOUGH() {
    veDOUGH = calculateVeDough(toBN(stakeAmount.bn.toString()), stakeDuration);
    veDOUGH = formatToken(veDOUGH, '.', 4);
  }

</script>

<StakedModal bind:this={stakedModal} />

<div class="font-huge text-center">Dough Staking</div>
<div class="font-thin text-lg text-center mt-10px">Get paid for Governing the DAO</div>

<div class="flex w-full pt-0 pb-20px flex flex-col items-center">

  {#if viewportComponent == views[currentView]}
  <div class="w-full flex flex-col lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px p-6" id="viewport" on:click={toggleView} on:outroend={updateViewportComponent} transition:fade>
    <svelte:component this={viewportComponent}></svelte:component>
  </div>
  {/if}
  <StakingStats showLoader={true} />
  <div
    class="w-full flex flex-col lg:flex-row items-center px-4 md:max-w-700px lg:px-4 lg:max-w-1280px p-6"
  >
      <!-- SUMMARY -->
      <StakingSummary />
      <!-- END SUMMARY -->

      <!-- YOUR STAKING -->
      <StakingPositions itemsNumber="3" scrollToTop={false} />
      <!-- END YOUR STAKING -->

      <!-- PAST REWARDS -->
      <StakingRewards itemsNumber="3" />
      <!-- END PAST REWARDS -->
    </div>


</div>
