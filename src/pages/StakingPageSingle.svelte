<script>
    import { onMount } from 'svelte';
    import Meta from '../components/elements/meta.svelte';
    import stakingPools from '../config/stakingPools.json';
    import smartcontracts from '../config/smartcontracts.json';
    import stakingPoolsABI from '../abis/stakingPoolsABI.json';
    import ERC20ABI from '../abis/erc20ABI.json';
    import images from "../config/images.json";
    import { _ } from "svelte-i18n";
    import { BigNumber, ethers } from "ethers";
    import displayNotification from "../notifications.js";
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

    import {
      amountFormatter
    } from "../components/helpers.js";

    import { get } from "svelte/store";
    import { formatEther, parseEther } from '@ethersproject/units';

    export let params;

    const slug = params[1];
    

    let stakingPool = '';
    let poolId = '';
    let stakeAmount = 0;
    let unstakeAmount = 0;

    let data = {
      accumulatedRewardWeight: BigNumber.from(0),
      escrowPercentage: BigNumber.from(0),
      exitFeePercentage: BigNumber.from(0),
      lastUpdatedBlock: BigNumber.from(0),
      rewardRate: BigNumber.from(0),
      rewardWeight: BigNumber.from(0),
      token: "0x0000000000000000000000000000000000000000",
      totalDeposited: BigNumber.from(0),
      userDeposited: BigNumber.from(0),
      userTokenApproval: BigNumber.from(0),
      userTokenBalance: BigNumber.from(0),
      userUnclaimed: BigNumber.from(0)
    }

    let stakingContract;
    let token;

    const getStakingPoolData = async () => {
      // put address in config
      const { provider, signer } = get(eth);
      stakingContract = new ethers.Contract(smartcontracts.stakingPools, stakingPoolsABI, signer || provider);
      data = (await stakingContract.getPools($eth.address))[poolId] || data;

      token = new ethers.Contract(data.token, ERC20ABI, signer || provider);
    };

    const formatAmount = (amount) => {
      return Number(formatEther(amount)).toFixed();
    };

    

    onMount(() => {
      stakingPool = stakingPools.find((item) => {
        if(item.slug === slug) {
          return item;
        }
      });
      poolId = stakingPool.id;
      getStakingPoolData();
    });


    $: (() => {
      if(window.localStorage.ref && ethers.utils.isAddress(window.localStorage.ref)) {
        console.log('//------------------------//')
        console.log('Ref Active', window.localStorage.ref);
        console.log('//------------------------//')
      }
    })()
    
    // update data on address or block change
    $: if($eth.address || $eth.currentBlockNumber) {
      $eth.address || !$eth.signer
      getStakingPoolData();
    };

    const claim = async () => {
      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
        connectWeb3();
        return;
      }

      const { emitter } = displayNotification(await stakingContract.claim(poolId));

      emitter.on("txConfirmed", ({ hash }) => {
        const { dismiss } = displayNotification({
          message: "Confirming...",
          type: "pending",
        });

        const subscription = subject("blockNumber").subscribe({
          next: () => {
            displayNotification({
              autoDismiss: 15000,
              message: `You claimed your rewards`,
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

    const unstake = async () => {
      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
        connectWeb3();
        return;
      }

      const { emitter } = displayNotification(await stakingContract.withdraw(poolId, parseEther(unstakeAmount)));

      emitter.on("txConfirmed", ({ hash }) => {
        const { dismiss } = displayNotification({
          message: "Confirming...",
          type: "pending",
        });

        const subscription = subject("blockNumber").subscribe({
          next: () => {
            displayNotification({
              autoDismiss: 15000,
              message: `You withdrawed`,
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

    const approve = async () => {
      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
        connectWeb3();
        return;
      }

      // if needs approval
      if(data.userTokenApproval.lt(parseEther(stakeAmount))) {
        const { emitter2 } = displayNotification(await token.approve(stakingContract.address, ethers.constants.MaxUint256));

        emitter2.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });

          const subscription = subject("blockNumber").subscribe({
            next: () => {
              displayNotification({
                autoDismiss: 15000,
                message: `You deposited`,
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
    }

    const stake = async () => {
      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
        connectWeb3();
        return;
      }

      if(!data.exitFeePercentage.eq(0)) {
        if(!window.confirm(`On exit a ${formatEther(data.exitFeePercentage.mul(100))}% fee will be charged on your principal`)) {
          return;
        }
      }

      // if needs approval
      if(data.userTokenApproval.lt(parseEther(stakeAmount))) {
        const { emitter2 } = displayNotification(await token.approve(stakingContract.address, ethers.constants.MaxUint256));

        emitter2.on("txConfirmed", ({ hash }) => {
          const { dismiss } = displayNotification({
            message: "Confirming...",
            type: "pending",
          });

          const subscription = subject("blockNumber").subscribe({
            next: () => {
              displayNotification({
                autoDismiss: 15000,
                message: `You deposited`,
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
      
      let emitter;

      if(window.localStorage.ref && ethers.utils.isAddress(window.localStorage.ref)) {
        console.log('//------------------------//')
        console.log('Ref Active', window.localStorage.ref);
        console.log('//------------------------//')

        emitter = displayNotification(await stakingContract.depositReferred(poolId, parseEther(stakeAmount), window.localStorage.ref)).emitter;
      } else {
        emitter = displayNotification(await stakingContract.deposit(poolId, parseEther(stakeAmount))).emitter;
      }


      emitter.on("txConfirmed", ({ hash }) => {
        const { dismiss } = displayNotification({
          message: "Confirming...",
          type: "pending",
        });

        const subscription = subject("blockNumber").subscribe({
          next: () => {
            displayNotification({
              autoDismiss: 15000,
              message: `You deposited`,
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
<Meta 
metadata={{
    title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
    description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
}}
/>

<div class="content flex flex-col">

    <div class="content flex ">
      <a href="#/staking" class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</a>
    </div>

    <div class="flex flex-col w-full justify-around md:flex-row">
        <!-- UNSTAKE BOX -->
        <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.withdraw} alt="PieDAO logo" />
              <div class="title text-lg">UNSTAKE</div>
              <div class="apy">
                {formatAmount(data.userDeposited)} {stakingPool.stakingTokenSymbol}
              </div>
              <div class="subtitle font-thin">STAKED BALANCE</div>
              
              <div class="apy text-sm">{stakingPool.stakingTokenName} </div>
              <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                  <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                      <div class="left float-left">{$_('general.amount')} to unstake</div>
                  </div>
                  <div class="bottom px-4 py-4 md:py-2">
                      <input bind:value={unstakeAmount}  type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                      <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                          <button on:click={() => {unstakeAmount = formatEther(data.userDeposited)}} class="text-black py-2px px-4px">MAX</button>
                      </div>
                  </div>            
              </div>
              {#if unstakeAmount == 0 }
                  <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
              {:else}
                <button on:click={unstake} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Unstake</button>
              {/if}
              
        </div>

        <!-- STAKE BOX -->
        <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.stake} alt="PieDAO logo" />
              <div class="title text-lg"> STAKE</div>
              <div class="apy">
                {formatAmount(data.userTokenBalance)} {stakingPool.stakingTokenSymbol}
              </div>
              <div class="subtitle font-thin">BALANCE</div>
              <div class="apy text-sm">{stakingPool.stakingTokenName} </div>
              <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                  <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                      <div class="text-black left black float-left">{$_('general.amount')} to stake</div>
                  </div>
                  <div class="bottom px-4 py-4 md:py-2">
                      <input bind:value={stakeAmount} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                      <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                          <button on:click={() => { stakeAmount = formatEther(data.userTokenBalance)
                            }} class="text-black py-2px px-4px">MAX</button>
                      </div>
                  </div>           
              </div>
                {#if stakeAmount == 0 }
                  <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
                {:else}
                  {#if parseEther(stakeAmount).gt(data.userTokenApproval)}
                  <button on:click={approve} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Approve</button>
                  {:else}
                    <button on:click={stake} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Stake</button>
                  {/if}
                {/if}
              
        </div>

        <!-- CLAIM BOX -->
        <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.claim} alt="PieDAO logo" />
              <div class="title text-lg">REWARDS AVAILABLE</div>
              <div class="subtitle font-thin">TO CLAIM</div>
              <div class="apy">
               {formatEther(data.userUnclaimed.mul(data.escrowPercentage).div(parseEther("1")))} Escrowed / {formatEther(data.userUnclaimed.sub(data.userUnclaimed.mul(data.escrowPercentage).div(parseEther("1"))))} Liquid
              </div>
              
              {#if data.userUnclaimed.eq(0)}
                <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">No rewards available</button>
              {:else}
                <button on:click={claim} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim</button>
              {/if}
        </div>
    </div>

    <div class="content flex">
      <div class="info-box">
        {#if data.exitFeePercentage.gt(0)}
          <p>
            ⚠️ This staking pool has a {formatEther(data.exitFeePercentage.mul(100))}% exit fee for 30 days, charged on your principal on exit ⚠️
          </p>
        {/if}
        {#if stakingPool.type == "sushi"}
          <p>
            Get Sushi LP token <a target="_blank" href="{stakingPool.lpLink}">here</a>
          </p>
        {/if}

        <p>
          Total pool rewards per week: {formatEther(data.rewardRate.mul(45371))} DOUGH
        </p>
        <p>
          Total staked: {formatEther(data.totalDeposited)} SLP
        </p>
        <p>
          Staked by you: {formatEther(data.userDeposited)} SLP
        </p>
        <p>
          Your share: {data.userDeposited.eq(0) ? "0" : formatEther(data.userDeposited.div(data.totalDeposited).mul(100))} %
        </p>
        <p>
          Your total rewards per week: {data.userDeposited.eq(0) ? "0" : formatEther(data.rewardRate.mul(45371).mul(data.userDeposited).div(data.totalDeposited))} DOUGH
        </p>
        <p>
          Your escrowed rewards per week: {data.userDeposited.eq(0) ? "0" : formatEther(data.rewardRate.mul(45371).mul(data.userDeposited).div(data.totalDeposited).mul(data.escrowPercentage).div(parseEther("1")))} DOUGH
        </p>
        <p>
          Your liquid rewards per week: {data.userDeposited.eq(0) ? "0" : formatEther(data.rewardRate.mul(45371).mul(data.userDeposited).div(data.totalDeposited).mul(parseEther("1").sub(data.escrowPercentage)).div(parseEther("1")))} DOUGH
        </p>
      </div>
    </div>
</div>
