<script>
  import { ethers } from "ethers";
  import BigNumber from "bignumber.js";
  import { _ } from "svelte-i18n";
  import images from "../config/images.json";
  import filter from 'lodash/filter';
  import rewardEscrewABI from '../config/rewardEscrowABI.json';
  import escrewRewardsStakingPool from '../config/escrewRewardsStakingPool.json';
  import recipeUnipool from '../config/unipoolABI.json';
  import geyserABI from '../config/geyser.json';
  import { get } from "svelte/store";
  import displayNotification from "../notifications.js";
  import { farming } from '../stores/eth/writables.js';
  import Meta from '../components/elements/meta.svelte';
  
  import {
    amountFormatter,
    toFixed,
    formatFiat,
    subscribeToBalance,
    subscribeToAllowance,
  } from "../components/helpers.js";

  import {
    allowances,
    functionKey,
    balanceKey,
    balances,
    connectWeb3,
    contract,
    eth,
    bumpLifecycle,
    subject,
  } from "../stores/eth.js";

  import incentivizedPools from '../config/farmingConf.js';


  let intiated = false;
  let amountToStake = 0;
  $: amountToClaim = pool && $balances[pool.KeyUnipoolEarnedBalance] ? $balances[pool.KeyUnipoolEarnedBalance] : "0.00000000";
  let amountToUnstake = 0;
  let isReady = false;


  $: needAllowance = true;

  $: {
    if(pool)
      needAllowance = needApproval(pool, ($allowances[pool.allowanceKey] || BigNumber(0)));
  }

  $: pool = null;


  $: geyserApy = {
    apy: 0,
    loaded: false,
  };

  $: rewardEscrewData = {
    totalEscrewed: 0,
    nextVestingWindow: null,
    numVestingEntries: null 
  };

  const estimateUnstake = async () => {
      const { provider } = get(eth);
      let contract = new ethers.Contract('0xb3c2b0056627cc1dc148d8fc29f5abdf4dd837bc', geyserABI, provider);
      let overrides = {
        from: $eth.address
      }

      let data = await contract.callStatic.updateAccounting(
        overrides
      );

      let loaded = false;
      let _totalStakingShareSeconds = data[3];
      let stakingShareSeconds = data[2];
      let totalUnlocked = data[1];
      let _pool = incentivizedPools[4];
      let rewardsPerBPT = 0;
      let $RewardsPerBPT = 0;
      let days60APY = 0;
      let apyV2 = 0;
      let apyV2NotOptimistic = 0;
      let yourStake = 0;
      let seconds = BigNumber(0);
      let unstakeNowRewards = 0;
      let totalUserRewards = totalUnlocked.mul(stakingShareSeconds).div(_totalStakingShareSeconds);
      let earnedOptimistic = BigNumber(totalUserRewards.toString()).dividedBy(10 ** 18);
      let tokenStakedPrice = 0;
      let DOUGHPrice = 0;
      let BPTPrice = 0;

      let balanceStaked = await contract.balanceOf($eth.address);
      
      if($farming[_pool.addressUniPoll] !== undefined) {
        DOUGHPrice = $farming[incentivizedPools[0].addressUniPoll] && $farming[incentivizedPools[0].addressUniPoll].DOUGHPrice ? $farming[incentivizedPools[0].addressUniPoll].DOUGHPrice : 0;
        BPTPrice = $farming[_pool.addressUniPoll].BPTPrice || 0;

        tokenStakedPrice = $farming[_pool.addressUniPoll].DOUGHPrice || 0

        const amount = balanceStaked;

        const bnJsAmount = BigNumber(balanceStaked.toString()).dividedBy(10 ** 18);
        unstakeNowRewards = await contract.callStatic.unstakeQuery(
          amount,
          overrides
        );

        unstakeNowRewards = (BigNumber(unstakeNowRewards.toString()).dividedBy(10 ** 18)).toNumber();
        seconds = (BigNumber(stakingShareSeconds.toString()).dividedBy( BigNumber( bnJsAmount ).multipliedBy(10**18) )).dividedBy(1000).dividedBy(1000);

        yourStake = bnJsAmount.toNumber();

        rewardsPerBPT = earnedOptimistic.toNumber() / yourStake;
        $RewardsPerBPT = rewardsPerBPT * DOUGHPrice;

        let rewardsPerBPTNotOptimistic = unstakeNowRewards / yourStake;
        let $RewardsPerBPTNotOptimistic = rewardsPerBPTNotOptimistic * DOUGHPrice;
        let days60APYNotOptimistic = $RewardsPerBPTNotOptimistic*100/BPTPrice;
        
        days60APY = $RewardsPerBPT*100/BPTPrice;
        apyV2 = days60APY * (31536000 / seconds.toNumber() )

        apyV2NotOptimistic =  days60APYNotOptimistic * (31536000 / seconds.toNumber() );
        loaded = true;
      }

      
      geyserApy = {
        BPTPrice,
        rewardsPerBPT,
        DOUGHPrice,
        seconds: seconds.toNumber(),
        earnedOptimistic: earnedOptimistic.toFixed(4),
        earnedNotOptimistic: unstakeNowRewards.toFixed(4),
        yourStake,
        apy: apyV2.toFixed(2),
        apyNotOptimistic: apyV2NotOptimistic.toFixed(2),
        totalStakingShareSeconds: _totalStakingShareSeconds.toString(),
        stakingShareSeconds: stakingShareSeconds.toString(),
        totalUnlocked: totalUnlocked.toString(),
        totalUserRewards: earnedOptimistic.toString(),
        $RewardsPerBPT,
        loaded,
        days60APY
      };

      return earnedOptimistic;
  };

  const toNum = (num) => (BigNumber(num.toString()).dividedBy(10 ** 18)).toNumber();

  window.addEventListener('price-update', async function (e) {
    isReady = true;
    incentivizedPools.forEach( async pool => {
        if(pool.contractType === 'escrewRewardsStakingPool') {
          const rewardEscrewContract = await contract({ address: pool.addressUniPoll, abi: escrewRewardsStakingPool });
          pool.escrowPercentage = (await rewardEscrewContract.escrowPercentage() / 1e18).toFixed(2);
        }
    });
    try {
      await estimateUnstake();  
    } catch(e){
      //console.log('estimateUnstake', e);
    }
  }, false);

  const fetchRewardEscrewData = async (address) => {
      const rewardEscrew = await contract({ address: '0x63cbd1858bd79de1a06c3c26462db360b834912d', abi: rewardEscrewABI });
      const totalEscrewed = await rewardEscrew.totalEscrowedAccountBalance(address);
      const numVestingEntries = await rewardEscrew.numVestingEntries(address);

      rewardEscrewData.totalEscrewed = toNum(totalEscrewed).toFixed(2);
      rewardEscrewData.numVestingEntries = numVestingEntries.toString();
  }

  const subscribeUserValuesForPool = async (p, address) => {
      try {    
          subscribeToBalance(p.addressTokenToStake, address, true);
          subscribeToAllowance(p.addressTokenToStake, address, p.addressUniPoll);

          p.allowanceKey = functionKey(p.addressTokenToStake, 'allowance', [address, p.addressUniPoll]);
          p.KeyAddressTokenToStake = balanceKey(p.addressTokenToStake, address);

          switch (p.contractType) {
            case 'UniPool':
            case 'escrewRewardsStakingPool':
              p.KeyUnipoolBalance = balanceKey(p.addressUniPoll, address);
              p.KeyUnipoolEarnedBalance = balanceKey(p.addressUniPoll, address, '.earned');
              break;
            case 'Geyser':
              p.KeyUnipoolBalance = balanceKey(p.addressUniPoll, address);
              await estimateUnstake();
            default:
              break;
          }
        } catch (e) {
          //console.log(e);
        }
  }

  $: if($eth.address) {
    if(isReady) {
      incentivizedPools.forEach( async pool => {
        if( pool.type === 'Balancer' && pool.contractType === 'Geyser') {
          try {
            await estimateUnstake();
          } catch (e) {

          }
        }
      });      
    }

    if(!intiated) {
      const address = $eth.address;
      fetchRewardEscrewData(address);
      
      incentivizedPools.forEach( (p) => subscribeUserValuesForPool(p, address));
      intiated = true;
      bumpLifecycle();
    }
  }

  const needApproval = (pool, allowance) => {
    if( allowance.isEqualTo(0) ) return true;
    if( allowance.isGreaterThanOrEqualTo( BigNumber(amountToStake)) ) return false;
  }

  const unstake = async () => {
    if(amountToUnstake === 0) {
      displayNotification({ message: "Amount is zero", type: "hint" });
      return;
    }

    let requestedAmount = BigNumber(amountToUnstake);
    const max = $balances[pool.KeyUnipoolBalance];

    if(requestedAmount.isGreaterThan(max)) {
      requestedAmount = max;
      amountToUnstake = max.toNumber();
      displayNotification({ message: "Amount set to max", type: "hint" });
    }

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    let unipool;
    let emitterToUse;
    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    if(pool.contractType === "UniPool" || pool.contractType === 'escrewRewardsStakingPool') {
      unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
      const { emitter } = displayNotification(await unipool.withdraw(amountWei) );
      emitterToUse = emitter;
    } else {
      unipool = await contract({ address: pool.addressUniPoll, abi: geyserABI });
      const { emitter } = displayNotification(await unipool.unstake(amountWei, 0x0) );
      emitterToUse = emitter;
    }
  

    emitterToUse.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} unstaked successfully`,
            type: "success",
          });
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success",
      };
    });
  }

  const exit = async () => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });

    const { emitter } = displayNotification(await unipool.exit() );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `You claimed and unstaked`,
            type: "success",
          });
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success",
      };
    });
  }


  const getRewards = async () => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
    const { emitter } = displayNotification(await unipool.getReward() );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} staked successfully`,
            type: "success",
          });
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success",
      };
    });
  }

const selectPool = (_pool) => {
  if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
  }
  pool = _pool;
}

</script>


<Meta 
    metadata={{
        title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
        description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
    }}
/>
<div class="content flex flex-col">
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-0 md:p-6 w-full">
        <!-- component -->
        {#if $eth.address}
        <div class="py-5">
          <main class="h-full">
              <div class="flex flex-col md:flex-row lg:flex-row items-center justify-center ">
                    <!-- Cards Container -->
                    <div class="flex flex-col md:flex-row lg:flex-row items-center w-100pc px-2">
                      <!-- Card -->
                      <div class="flex p-6 mx-4 my-2 bg-white rounded-sm shadow-xs dark:bg-gray-800 w-100pc md:w-auto lg:w-auto">
                        <div class="p-3 mr-4 text-xl">
                          💰
                        </div>
                        <div>
                          <p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            DOUGH in Escrow
                          </p>
                          <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            {formatFiat(rewardEscrewData.totalEscrewed, ',', '.', '')}
                          </p>
                        </div>
                      </div>
                      <!-- Card -->
                      <div class="flex p-6 mx-4 my-2 bg-white rounded-sm shadow-xs dark:bg-gray-800 w-100pc md:w-auto lg:w-auto">
                          <div class="p-3 mr-4 text-xl">
                              🧮
                            </div>
                        <div>
                          <p class="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Vesting Entries
                          </p>
                          <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            {rewardEscrewData.numVestingEntries ? rewardEscrewData.numVestingEntries : 'n/a'}
                          </p>
                        </div>
                      </div>
                    </div>
        
                  </div>
          </main>
        </div>
        {/if}

        {#if !pool}
        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">Select a pool</h1>
        <div class="flex flex-col w-full flex-wrap justify-center md:flex-row">
            {#each filter(incentivizedPools, { deprecated: false }) as ammPool}
              {#if ammPool.highlight }
                <div class="highlight-box farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                  <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> {ammPool.name} </div>
                    <div class="subtitle font-thin">{ammPool.description}</div>
                    <!-- <div class="apy">{ammPool.weeklyRewards} {ammPool.rewards_token}</div> -->
                    <div class="apy"> <a href={ammPool.poolLink} target="_blank"> {ammPool.platform} </a></div>
                    <div class="apy">
                      {#if $farming[ammPool.addressUniPoll] !== undefined}
                        {$farming[ammPool.addressUniPoll].apr}
                      {:else}
                        n/a
                      {/if}
                    </div>
                    {#if ammPool.enabled}
                      <button on:click={() => selectPool(ammPool) } class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
                    {:else}
                      <button disabled class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Oct 3rd, 6:00pm UTC</button>
                    {/if}
                </div>
              {:else}
                <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                  <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> {ammPool.name} </div>
                    <div class="subtitle font-thin">{ammPool.description}</div>
                    <!-- <div class="apy">{ammPool.weeklyRewards} {ammPool.rewards_token}</div> -->
                    <div class="apy">{ammPool.platform}</div>
                    
                    {#if ammPool.contractType === 'Geyser'}
                      <div style="position:absolute; top:10px; right:10px;" class="apy"><a target="_blank" href="https://forum.piedao.org/t/pip-20-week-2-incentive-programs/197">ℹ️</a></div>
                      
                      {#if geyserApy.loaded === false}
                        Loading 🧘‍♀️
                      {/if}
                      
                      {#if geyserApy.loaded && geyserApy.yourStake > 0}
                        <div class="apy">{geyserApy.apy} %</div>
                      {/if}

                      {#if geyserApy.loaded && geyserApy.yourStake == 0}
                        <div class="apy">You are not staking</div>
                      {/if}

                    {:else}
                      <div class="apy">
                        {#if $farming[ammPool.addressUniPoll] !== undefined}
                          {$farming[ammPool.addressUniPoll].apr}
                        {:else}
                          n/a
                        {/if}
                      </div>
                    {/if}

                    {#if ammPool.enabled}
                      <button on:click={() => selectPool(ammPool) } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
                    {:else}
                      <button disabled class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Oct 3rd, 6:00pm UTC</button>
                    {/if}
                </div>
              {/if}
            {/each}
        </div>

        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">⚠️ Deprecated pools</h1>
        <div class="flex flex-col w-full flex-wrap justify-center md:flex-row">
          {#each filter(incentivizedPools, { deprecated: true }) as ammPool}
            <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg"> {ammPool.name} </div>
                <div class="subtitle font-thin">{ammPool.description}</div>
                <div class="apy">{ammPool.platform}</div>

                {#if ammPool.enabled}
                  <button on:click={() => selectPool(ammPool) } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
                {:else}
                  <button disabled class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Oct 3rd, 6:00pm UTC</button>
                {/if}
            </div>
          {/each}
        </div>
        
        {:else}
            <div>
              <button on:click={() => pool = null } class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</button>
              {#if pool.KeyAddressTokenToStake && $balances[pool.KeyUnipoolBalance] > 0 && pool.contractType !== 'Geyser' }
                <button on:click={() => exit() } class="float-right btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim and Unstake</button>
              {/if}
            </div>

            <div class="flex flex-col w-full justify-evenly md:flex-row">
              <!-- UNSTAKE BOX -->
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.withdraw} alt="PieDAO logo" />
                    <div class="title text-lg">UNSTAKE {#if pool.contractType === "Geyser"} and CLAIM {/if}</div>
                    <div class="apy">
                      {pool.KeyAddressTokenToStake ? amountFormatter({ amount: $balances[pool.KeyUnipoolBalance], displayDecimals: 4}) : 0.0000} {pool.toStakeSymbol}
                    </div>
                    <div class="subtitle font-thin">STAKED BALANCE</div>
                    
                    <div class="apy text-sm">{pool.toStakeDesc}</div>
                    <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to unstake</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input bind:value={amountToUnstake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button on:click={() => {
                                  if($balances[pool.KeyUnipoolBalance]) {
                                    amountToUnstake = $balances[pool.KeyUnipoolBalance];
                                  } else {
                                    amountToUnstake = 0;
                                  }}} class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>            
                    </div>
                    {#if amountToUnstake === 0 }
                        <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
                    {:else}
                      <button on:click={() => unstake()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Unstake</button>
                    {/if}
                    
              </div>

              <!-- CLAIM BOX -->
              {#if pool.contractType === "UniPool" || pool.contractType === 'escrewRewardsStakingPool'}
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.claim} alt="PieDAO logo" />
                    <div class="title text-lg">REWARDS AVAILABLE</div>
                    <div class="subtitle font-thin">{pool.rewards_token} TO CLAIM</div>
                    <div class="apy">
                      {pool.KeyUnipoolEarnedBalance ? amountFormatter({ amount: $balances[pool.KeyUnipoolEarnedBalance], displayDecimals: 16}) : 0.0000} {pool.rewards_token}
                    </div>

                    {#if pool.contractType === 'escrewRewardsStakingPool'}
                      <div class="apy">
                        <strong>{toFixed($balances[pool.KeyUnipoolEarnedBalance] * pool.escrowPercentage, 3) } </strong> Escrowed / 
                        <strong>{toFixed($balances[pool.KeyUnipoolEarnedBalance] * (1-pool.escrowPercentage), 3) } </strong> Liquid
                      </div>
                    {/if}

                    
                    <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to claim</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input disabled bind:value={amountToClaim} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button on:click={() => {
                                  if($balances[pool.KeyUnipoolEarnedBalance]) {
                                    amountToClaim = $balances[pool.KeyUnipoolEarnedBalance].toFixed(4, BigNumber.ROUND_DOWN);
                                  } else {
                                    amountToClaim = 0;
                                  }}} class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>            
                    </div>
                    <button on:click={() => getRewards()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim</button>
              </div>
              {/if}

              {#if pool.contractType === "Geyser"}
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.claim} alt="PieDAO logo" />
                    <div class="title text-lg">REWARDS EARNED</div>
                    <div class="subtitle font-thin">Optimistic reward</div>
                    <div class="apy">
                      {geyserApy.earnedOptimistic} {pool.rewards_token}
                    </div>
                    <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} accrued</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input disabled bind:value={geyserApy.earnedOptimistic} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                        </div>            
                    </div>
              </div>
              {/if}
            </div>
            <div class="info-box">
              {#if $farming[pool.addressUniPoll] !== undefined && pool.addressTokenToStake !== "0xe4f726adc8e89c6a6017f01eada77865db22da14"}
                <br/><br/>
                
                <p>There are total of  : <strong>{toFixed($farming[pool.addressUniPoll].totalBPTAmount, 4)} {pool.toStakeSymbol} </strong>.</p>
                <p>There are total   : <strong>{toFixed($farming[pool.addressUniPoll].totalStakedBPTAmount, 4)} {pool.toStakeSymbol}</strong> staked in the Staking contract.</p>
                {#if pool.KeyAddressTokenToStake && $balances[pool.KeyUnipoolBalance]}
                  <p>You are staking   : <strong>{toFixed($balances[pool.KeyUnipoolBalance] * 100 / $farming[pool.addressUniPoll].totalStakedBPTAmount, 3) }% </strong> of the pool
                          = [{toFixed($farming[pool.addressUniPoll].DOUGHperBPT * $balances[pool.KeyUnipoolBalance].toNumber(), 2)} {pool.containing[0].symbol}, {toFixed($farming[pool.addressUniPoll].WETHperBPT * $balances[pool.KeyUnipoolBalance].toNumber(), 2)}  {pool.containing[1].symbol}]
                          = {formatFiat( ($farming[pool.addressUniPoll].DOUGHperBPT * $balances[pool.KeyUnipoolBalance].toNumber() * $farming[pool.addressUniPoll].DOUGHPrice + $farming[pool.addressUniPoll].WETHperBPT * $balances[pool.KeyUnipoolBalance].toNumber() * $farming[pool.addressUniPoll].ETHPrice).toFixed(2) )}
                  </p>
                {/if}   
              {/if}
              
              {#if pool.contractType === "Geyser"}
                <br/>
                {#if geyserApy.yourStake}
                  <p> Your stake of <strong>{geyserApy.yourStake.toFixed(2)} BPT</strong> is earning right now <strong>{geyserApy.earnedOptimistic} DOUGH</strong> assuming you will not unstake until the end of the program. </p>
                  <p>Approx <strong>{geyserApy.apy}%</strong>.</p>
                  <p>If you would unstake right now, you would get exactly <strong>{geyserApy.earnedNotOptimistic} DOUGH</strong>, which is approx <strong>{geyserApy.apyNotOptimistic}% APR</strong>.</p>
                {/if}
              {/if}
            </div>
        {/if}
    </div>

</div>