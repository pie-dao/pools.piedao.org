<script>
  import { ethers } from "ethers";
  import { onMount } from 'svelte';
  import BigNumber from "bignumber.js";
  import { validateIsAddress } from '@pie-dao/utils';
  import { _ } from "svelte-i18n";
  import images from "../config/images.json";
  import { currentRoute } from '../stores/routes.js';
  
  import filter from 'lodash/filter';
  import isNaN from 'lodash/isNaN';

  import recipeUnipool from '../config/unipoolABI.json';
  import BALANCER_POOL_ABI from '../config/balancerPoolABI.json';
  import geyserABI from '../config/geyser.json';
  import { get } from "svelte/store";
  import displayNotification from "../notifications.js";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import { farming } from '../stores/eth/writables.js';
  import {
    amountFormatter,
    fetchPieTokens,
    fetchPooledTokens,
    maxAmount,
    getTokenImage,
    fetchEthBalance,
    fetchCalcToPie,
    toFixed,
    calculateAPRBalancer,
    calculateAPRUniswap,
    formatFiat,
    subscribeToBalance,
    subscribeToAllowance,
    subscribeToStaking,
    subscribeToStakingEarnings,
    subscribeToStakingEarningsGeyser,
  } from "../components/helpers.js";

  import {
    allowances,
    functionKey,
    approveMax,
    balanceKey,
    balances,
    connectWeb3,
    contract,
    eth,
    pools,
    bumpLifecycle,
    subject,
  } from "../stores/eth.js";

  const isAddress = (thing) => (
    thing
    && ethers.utils.isHexString(thing)
    && thing.length === 42
  );

  let ethKey;
  let ethBalance = 0;
  let intiated = false;
  let amountToStake = 0;
  $: amountToClaim = pool && $balances[pool.KeyUnipoolEarnedBalance] ? $balances[pool.KeyUnipoolEarnedBalance] : "0.00000000";
  let amountToUnstake = 0;
  let isReady = false;
  
  const referral = $currentRoute.params.referral || window.localStorage.getItem('referral');


  $: needAllowance = true;
  $: incentivizedPools = [
    {
      addressTokenToStake: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
      addressUniPoll: '0x8314337d2b13e1A61EadF0FD1686b2134D43762F',
      aprEnabled: true,
      deprecated: false,
      poolLink: "https://pools.balancer.exchange/#/pool/0xfae2809935233d4bfe8a56c2355c4a2e7d1fff1a/",
      name: 'DOUGH / ETH',
      platform: "⚖️ Balancer",
      description: 'WEEKLY REWARDS',
      rewards_token: 'DOUGH',
      weeklyRewards: formatFiat(110000, ',', '.', ''),
      apy: 1.8,
      toStakeSymbol: 'BPT',
      toStakeDesc: 'Balancer: DOUGH/ETH 80/20',
      allowance: 0,
      type: 'Balancer',
      contractType: 'UniPool',
      containing: [
        {
          symbol: "DOUGH",
          address: "0xad32A8e6220741182940c5aBF610bDE99E737b2D",
          balance: '0',
          icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ],
      allowanceKey: '',
      highlight: true,
      needAllowance: true,
      enabled: true,
    },
    {
      addressTokenToStake: '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF',
      aprEnabled: true,
      deprecated: false,
      addressUniPoll: '0x220f25C2105a65425913FE0CF38e7699E3992B97',
      poolLink: "https://pools.balancer.exchange/#/pool/0x35333cf3db8e334384ec6d2ea446da6e445701df/",
      name: 'DEFI+S / ETH',
      type: 'Balancer',
      contractType: 'UniPool',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ],
      rewards_token: 'DOUGH',
      toStakeSymbol: 'BPT',
      toStakeDesc: 'Balancer: DEFI+S/ETH 70/30',
      platform: "⚖️ Balancer",
      description: 'WEEKLY REWARDS',
      weeklyRewards: formatFiat(20000, ',', '.', ''),
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      needAllowance: true,
      enabled: true,
    },
    {
      addressTokenToStake: '0xa795600590a7da0057469049ab8f1284baed977e',
      aprEnabled: false,
      deprecated: false,
      addressUniPoll: '0xb3c2b0056627cc1dc148d8fc29f5abdf4dd837bc',
      poolLink: "https://pools.balancer.exchange/#/pool/0xa795600590a7da0057469049ab8f1284baed977e/",
      name: 'DEFI+L/ETH',
      type: 'Balancer',
      contractType: 'Geyser',
      containing: [
        {
          symbol: "DEFI+L",
          address: "0x78f225869c08d478c34e5f645d07a87d3fe8eb78",
          balance: '0',
          icon: getTokenImage('0x78f225869c08d478c34e5f645d07a87d3fe8eb78')
        },
        {
          symbol: "ETH",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ],
      rewards_token: 'DOUGH',
      toStakeSymbol: 'BPT',
      toStakeDesc: 'Balancer: DEFI+L/ETH 70/30',
      platform: "⚖️ Balancer",
      description: 'WEEKLY REWARDS',
      weeklyRewards: formatFiat(20000, ',', '.', ''),
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      needAllowance: true,
      enabled: true,
    },
    {
      addressTokenToStake: '0x7aeFaF3ea1b465dd01561B0548c9FD969e3F76BA',
      aprEnabled: true,
      deprecated: true,
      addressUniPoll: '0x64964cb69f40A1B56AF76e32Eb5BF2e2E52a747c',
      name: 'DEFI+S / DAI',
      poolLink: 'https://app.uniswap.org/#/add/0x6B175474E89094C44Da98b954EedeAC495271d0F/0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C',
      platform: "🦄 Uniswap",
      contractType: 'UniPool',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
          balance: '0',
          icon: getTokenImage('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c')
        },
        {
          symbol: "DAI",
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          balance: '0',
          icon: getTokenImage('0x6B175474E89094C44Da98b954EedeAC495271d0F')
        },
      ],
      type: 'UniswapV2',
      toStakeDesc: 'Uniswap: DEFI+S/DAI 50/50',
      toStakeSymbol: 'LP',
      description: 'DEPRECATED POOL',
      rewards_token: 'DOUGH',
      weeklyRewards: formatFiat(25000, ',', '.', ''),
      apy: 1.8,
      allowance: 0,
      allowanceKey: '',
      needAllowance: true,
      enabled: true,
    },
  ]

  $: {     
    if(pool)
      needAllowance = needApproval(pool, ($allowances[pool.allowanceKey] || BigNumber(0)));
  }

  $: pool = null;

  $: geyserEarned = BigNumber(0);

  $: geyserApy = {
    apy: 0,
    loaded: false,
  };

  const estimateUnstake = async () => {
      const { provider, signer } = get(eth);
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
      let _pool = incentivizedPools[2];
      let apy8Wweeks = 0;
      let apy = 0;
      let rewardsPerBPT = 0;
      let $RewardsPerBPT = 0;
      let days60APY = 0;
      let apyV2 = 0;
      let apyV2NotOptimistic = 0;
      let yourStake = 0;
      let seconds = BigNumber(0);
      let rewardPerSecond = 0;
      let rewardPerWeek = 0;
      let rewardPer8Week = 0;
      let unstakeNowRewards = 0;
      let totalUserRewards = totalUnlocked.mul(stakingShareSeconds).div(_totalStakingShareSeconds);
      let earnedOptimistic = BigNumber(totalUserRewards.toString()).dividedBy(10 ** 18);
      let tokenStakedPrice = 0;
      let DOUGHPrice = 0;
      let BPTPrice = 0;

      
      if($balances[_pool.KeyUnipoolBalance] && $farming[_pool.addressUniPoll] !== undefined) {
        DOUGHPrice = $farming[incentivizedPools[0].addressUniPoll] && $farming[incentivizedPools[0].addressUniPoll].DOUGHPrice ? $farming[incentivizedPools[0].addressUniPoll].DOUGHPrice : 0;
        BPTPrice = $farming[_pool.addressUniPoll].BPTPrice || 0
        tokenStakedPrice = $farming[_pool.addressUniPoll].DOUGHPrice || 0

        const amount = ethers.BigNumber.from(
          BigNumber($balances[_pool.KeyUnipoolBalance].toString())
            .multipliedBy(10 ** 18)
            .toFixed(0),
        );

        unstakeNowRewards = await contract.callStatic.unstakeQuery(
          amount,
          overrides
        );

        unstakeNowRewards = (BigNumber(unstakeNowRewards.toString()).dividedBy(10 ** 18)).toNumber();
        seconds = (BigNumber(stakingShareSeconds.toString()).dividedBy( BigNumber( $balances[_pool.KeyUnipoolBalance].toString() ).multipliedBy(10**18) )).dividedBy(1000).dividedBy(1000);

        yourStake = $balances[_pool.KeyUnipoolBalance].toNumber();

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
        loaded
      };

      console.log('geyserApy', geyserApy);

      return earnedOptimistic;
  };

  window.addEventListener('price-update', async function (e) {
    console.log('price-update', e)
    isReady = true;
    incentivizedPools.forEach( async pool => {
      if( pool.type === 'UniswapV2') {
        await calculateAPRUniswap(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
      } else {
        await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
      }
    })
    await estimateUnstake();
    
  }, false);

  $: if($eth.address) {
    if(isReady) {
      incentivizedPools.forEach( async pool => {
        if( pool.type === 'UniswapV2') {
          await calculateAPRUniswap(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
        } 
        
        if( pool.type === 'Balancer' && pool.contractType === 'UniPool') {
          await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
        }

        if( pool.type === 'Balancer' && pool.contractType === 'Geyser') {
          await calculateAPRBalancer(pool.addressUniPoll, pool.addressTokenToStake, null, null, pool.containing[0].address, pool.containing[1].address);
          await estimateUnstake();
        }
      });
      
    }

    if(!intiated) {
      const address = $eth.address;

      incentivizedPools.forEach( async p => {      
        try {
          calculateAPRBalancer()
          subscribeToBalance(p.addressTokenToStake, address, true);
          subscribeToStaking(p.addressUniPoll, address, true);
          subscribeToAllowance(p.addressTokenToStake, address, p.addressUniPoll);

          p.allowanceKey = functionKey(p.addressTokenToStake, 'allowance', [address, p.addressUniPoll]);
          p.KeyAddressTokenToStake = balanceKey(p.addressTokenToStake, address);

          if(p.contractType === "UniPool") {
            subscribeToStakingEarnings(p.addressUniPoll, address, true);
            p.KeyUnipoolBalance = balanceKey(p.addressUniPoll, address);
            p.KeyUnipoolEarnedBalance = balanceKey(p.addressUniPoll, address, '.earned');
          } else {
            console.log("Getting staked balance from geyser");
            console.log(p.addressUniPoll, "address");
            subscribeToStakingEarningsGeyser(p.addressUniPoll, address, true);
            p.KeyUnipoolBalance = balanceKey(p.addressUniPoll, address);
            await estimateUnstake();
          }
        } catch (e) {
          console.log(e);
        }
        
      });
      intiated = true;
      bumpLifecycle();
    }
  }

  const needApproval = (pool, allowance) => {
    if( allowance.isEqualTo(0) ) return true;
    if( allowance.isGreaterThanOrEqualTo( BigNumber(amountToStake)) ) return false;
  }

  const action = async (pool, actionType) => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const { addressTokenToStake, addressUniPoll } = pool;

    if (actionType === "unlock") {
      await approveMax(addressTokenToStake, addressUniPoll);
      needAllowance = false;
    }
  };

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

    if(pool.contractType === "UniPool") {
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

  const stake = async () => {
    if(amountToStake === 0) {
      displayNotification({ message: "Amount it zero", type: "hint" });
      return;
    }
    let requestedAmount = BigNumber(amountToStake);
    const max = $balances[pool.KeyAddressTokenToStake];
    let referralValidated = '0x4efD8CEad66bb0fA64C8d53eBE65f31663199C6d'; //Agent address

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    if(requestedAmount.isGreaterThan(max)) {
      requestedAmount = max;
      amountToStake = max.toNumber();
      displayNotification({ message: "Amount set to max", type: "hint" });
    }

    if(referral && isAddress(referral) && referral.toLowerCase() !== $eth.address.toLowerCase()) {
      console.log('Im setting the referral to '+referral);
      referralValidated = referral;
    }

    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);
    let unipool;
    let emitterToUse;
    if(pool.contractType === "UniPool") {
      unipool = await contract({ address: pool.addressUniPoll, abi: recipeUnipool });
      console.log(`Staking ${amountToStake} ${pool.toStakeSymbol} with referral ${referralValidated}`)
      const { emitter } = displayNotification(await unipool["stake(uint256,address)"](amountWei, referralValidated) );
      emitterToUse = emitter;
    } else {
      unipool = await contract({ address: pool.addressUniPoll, abi: geyserABI });
      const { emitter } = displayNotification(await unipool["stake(uint256)"](amountWei) );
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

</script>



<div class="content flex flex-col">
    <img class="banner-desktop" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4.png" />
    <img class="banner-mobile" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4-mobile.png" />
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-0 md:p-6 w-full">    
        {#if !pool}
        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">Select a pool</h1>
        <div class="flex flex-col w-full justify-center md:flex-row">
            {#each filter(incentivizedPools, { deprecated: false }) as ammPool}
              {#if ammPool.highlight }
                <div class="highlight-box farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                  <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> <a href={ammPool.poolLink} target="_blank"> {ammPool.name} </a></div>
                    <div class="subtitle font-thin">{ammPool.description}</div>
                    <div class="apy">{ammPool.weeklyRewards} {ammPool.rewards_token}</div>
                    <div class="apy"> <a href={ammPool.poolLink} target="_blank"> {ammPool.platform} </a></div>
                    <div class="apy">
                      {#if $farming[ammPool.addressUniPoll] !== undefined}
                        {$farming[ammPool.addressUniPoll].apr}
                      {:else}
                        n/a
                      {/if}
                    </div>
                    {#if ammPool.enabled}
                      <button on:click={() => pool = ammPool } class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
                    {:else}
                      <button disabled class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Oct 3rd, 6:00pm UTC</button>
                    {/if}
                </div>
              {:else}
                <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                  <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> <a href={ammPool.poolLink} target="_blank"> {ammPool.name} </a></div>
                    <div class="subtitle font-thin">{ammPool.description}</div>
                    <div class="apy">{ammPool.weeklyRewards} {ammPool.rewards_token}</div>
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
                      <button on:click={() => pool = ammPool } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
                    {:else}
                      <button disabled class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Oct 3rd, 6:00pm UTC</button>
                    {/if}
                </div>
              {/if}
            {/each}
        </div>

        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">⚠️ Deprecated pools</h1>
        <div class="flex flex-col w-full justify-center md:flex-row">
          {#each filter(incentivizedPools, { deprecated: true }) as ammPool}
            <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                <div class="title text-lg"> <a href={ammPool.poolLink} target="_blank"> {ammPool.name} </a></div>
                <div class="subtitle font-thin">{ammPool.description}</div>
                <div class="apy">{ammPool.platform}</div>

                {#if ammPool.enabled}
                  <button on:click={() => pool = ammPool } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
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

            <div class="flex flex-col w-full justify-around md:flex-row">
              <!-- UNSTAKE BOX -->
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.withdraw} alt="PieDAO logo" />
                    <div class="title text-lg">UNSTAKE {#if pool.contractType === "Geyser"} and CLAIM {/if}</div>
                    <div class="apy">
                      {pool.KeyAddressTokenToStake ? amountFormatter({ amount: $balances[pool.KeyUnipoolBalance], displayDecimals: 4}) : 0.0000} {pool.toStakeSymbol}
                    </div>
                    <div class="subtitle font-thin">STAKED BALANCE</div>
                    
                    <div class="apy text-sm">{pool.toStakeDesc}</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
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

              <!-- STAKE BOX -->
              <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.stake} alt="PieDAO logo" />
                    <div class="title text-lg"> STAKE</div>
                    <div class="apy">
                      {pool.KeyAddressTokenToStake ? amountFormatter({ amount: $balances[pool.KeyAddressTokenToStake], displayDecimals: 4}) : 0.0000} {pool.toStakeSymbol}
                    </div>
                    <div class="subtitle font-thin">BALANCE</div>
                    <div class="apy text-sm">{pool.toStakeDesc}</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="text-black left black float-left">{$_('general.amount')} to stake</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input bind:value={amountToStake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button on:click={() => {
                                  if($balances[pool.KeyAddressTokenToStake]) {
                                    amountToStake = $balances[pool.KeyAddressTokenToStake];
                                  } else {
                                    amountToStake = 0;
                                  }}} class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>           
                    </div>
                    {#if needAllowance }
                      <button on:click={ () => action(pool, 'unlock')} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Approve</button>
                    {:else}
                      {#if amountToStake === 0 }
                        <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
                      {:else}
                        <button on:click={() => stake()} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Stake</button>
                      {/if}
                    {/if}
              </div>

              <!-- CLAIM BOX -->
              {#if pool.contractType === "UniPool"}
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.claim} alt="PieDAO logo" />
                    <div class="title text-lg">REWARDS AVAILABLE</div>
                    <div class="subtitle font-thin">{pool.rewards_token} TO CLAIM</div>
                    <div class="apy">
                      {pool.KeyUnipoolEarnedBalance ? amountFormatter({ amount: $balances[pool.KeyUnipoolEarnedBalance], displayDecimals: 16}) : 0.0000} {pool.rewards_token}
                    </div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
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
                    <div class="subtitle font-thin">{geyserEarned}</div>
                    <div class="apy">
                      {pool.KeyUnipoolEarnedBalance ? amountFormatter({ amount: $balances[pool.KeyUnipoolEarnedBalance], displayDecimals: 16}) : 0.0000} {pool.rewards_token}
                    </div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} accrued</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input disabled bind:value={geyserEarned} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                        </div>            
                    </div>
              </div>
              {/if}
            </div>
            <div class="info-box">
              {#if $farming[pool.addressUniPoll] !== undefined}
                <p>There are total of  : <strong>{toFixed($farming[pool.addressUniPoll].totalBPTAmount, 4)} BPT </strong>.</p>
                <p>There are total   : <strong>{toFixed($farming[pool.addressUniPoll].totalStakedBPTAmount, 4)} BPT</strong> staked in the Staking contract.</p>
                {#if pool.KeyAddressTokenToStake && $balances[pool.KeyUnipoolBalance]}
                  <p>You are staking   : <strong>{toFixed($balances[pool.KeyUnipoolBalance] * 100 / $farming[pool.addressUniPoll].totalStakedBPTAmount, 3) }% </strong> of the pool
                          = [{toFixed($farming[pool.addressUniPoll].DOUGHperBPT * $balances[pool.KeyUnipoolBalance].toNumber(), 2)} {pool.containing[0].symbol}, {toFixed($farming[pool.addressUniPoll].WETHperBPT * $balances[pool.KeyUnipoolBalance].toNumber(), 2)}  {pool.containing[1].symbol}]
                          = {formatFiat( ($farming[pool.addressUniPoll].DOUGHperBPT * $balances[pool.KeyUnipoolBalance].toNumber() * $farming[pool.addressUniPoll].DOUGHPrice + $farming[pool.addressUniPoll].WETHperBPT * $balances[pool.KeyUnipoolBalance].toNumber() * $farming[pool.addressUniPoll].ETHPrice).toFixed(2) )}
                  </p>
                {/if}   
              {/if}
              
              {#if pool.contractType === "Geyser"}
                <br/>
                <p> Your stake of <strong>{geyserApy.yourStake.toFixed(2)} BPT</strong> is earning right now <strong>{geyserApy.earnedOptimistic} DOUGH</strong> assuming you will not unstake until the end of the program. </p>
                <p>Approx <strong>{geyserApy.apy}%</strong>.</p>
                <p>If you would unstake right now, you would get exactly <strong>{geyserApy.earnedNotOptimistic} DOUGH</strong>, which is approx <strong>{geyserApy.apyNotOptimistic}% APR</strong>.</p>
              {/if}

              <br/><br/>
              <p>You can add liquidity to the {pool.platform} pool to get {pool.toStakeSymbol} tokens <a href={pool.poolLink}>HERE</a></p>
              <p>Weekly rewards for this pool are <strong>{pool.weeklyRewards} {pool.rewards_token}</strong></p>
              <p>Buy {pool.containing[0].symbol} on <a target="_blank" href="https://balancer.exchange/#/swap/ether/{pool.containing[0].address}">Balancer</a> or <a href="#/pools/{pool.containing[0].address}">mint now!</a></p>
              <p>Buy DOUGH on <a target="_blank" href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D">Balancer</a></p>
            </div>
        {/if}
    </div>

</div>