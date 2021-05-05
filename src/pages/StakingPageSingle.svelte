<script>
    import { onMount } from 'svelte';
    import Meta from '../components/elements/meta.svelte';
    import stakingPools from '../config/stakingPools.json';
    import smartcontracts from '../config/smartcontracts.json';
    import stakingPoolsABI from '../abis/stakingPoolsABI.json';
    import { getTokenImage, toFixed } from './../components/helpers.js';
    import ERC20ABI from '../abis/erc20ABI.json';
    import images from "../config/images.json";
    import { _ } from "svelte-i18n";
    import { BigNumber, ethers } from "ethers";
    import displayNotification from "../notifications.js";
    import {
      connectWeb3,
      eth,
      subject,
    } from "../stores/eth.js";

    import { get } from "svelte/store";
    import { formatEther, parseEther } from '@ethersproject/units';

    export let params;

    const slug = params[1];
    

    let stakingPool = { containing: []};
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
      // TODO
      let res = (await stakingContract.getPools('0x520C1e99eBa69e2E10AF2DE1BcE326D04EFD21B0'))[poolId] || data;

      const percentage = Number(formatEther(data.escrowPercentage)) * 100;;
      if( percentage !== undefined) {
        data.escrowPercentageLabel = `${percentage}%`;
        data.liquidPercentageLabel = `${100 - percentage}%`;
      } else {
        data.escrowPercentageLabel = `n/a`;
        data.liquidPercentageLabel = `n/a`;
      }

      data = {
        ...data,
        ...res
      };

      token = new ethers.Contract(res.token, ERC20ABI, signer || provider);
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


<div class="w-100pc m-0 p-0 flex justify-center">
  <div class="w-100pc lg:max-w-900px flex flex-col items-center justify-center py-0 md:py-8 px-2"> 
    <div class="w-100pc">
      <a href="#/farms" class="flex items-center hover:opacity-60 mb-4">
        <img class="z-10 w-20px mr-2" src={images.backarrow} alt="token name" />
        <span>Back to Farms</span>
      </a>
    </div>

    <div class="flex justify-center items-start md:items-center">
      <div class="flex flex-col justify-start p-1px cardbordergradient w-100pc min-h-100pc   lg:min-w-30pc lg:min-h-50pc">

        <span class="py-0 px-4 mt-6 md:px-12 font-thin">
          <span class="flex mt-0 md:mt-4 w-100pc">
            <div class="mr-4 flex items-center">
              {#each stakingPool.containing as asset, i}
                <img
                  class={i === 0 ? "z-10 w-40px md:w-60px" : "-ml-15px md:-ml-20px w-40px md:w-60px"}
                  src={getTokenImage(asset.address)}
                  alt="token name"
                />
              {/each}
            </div>
            <div class="flex flex-col justify-around">
              <div class="flex items-center">
                <span class="text-base md:text-lg md:leading-6 font-bold">{stakingPool.name}</span>
                <!-- <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2 font-bold">55.30% APY</span> -->
              </div>
              <span class="block md:hidden text-sm leading-6 font-bold">Pool: Balancer</span>
              <span class="text-sm font-thin">{data.liquidPercentageLabel} Liquid - {data.escrowPercentageLabel} Escrowed</span>
              <span class="block md:hidden text-sm text-grey">Tot 166.345 BPT Staked</span>
            </div>
            <div class="hidden md:flex flex-col justify-around text-right ml-auto font-thin">
              <span class="text-lg leading-6">Balancer</span>
              <span class="text-sm px-1 text-grey">Tot 166.345 BPT Staked</span>
            </div>
          </span>
      
          <span class="w-100pc">
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
              <div class="flex items-center justify-between">
                <div class="flex nowrap intems-center p-1 font-thin">Amount to Stake</div>
                <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                  <button on:click={() => { stakeAmount = formatEther(data.userTokenBalance)}} class="oven-withdraw-button">100%</button>
                </div>
              </div>
              <div class="flex nowrap items-center p-1">
                <input
                  bind:value={stakeAmount}
                  class="swap-input-from"
                  inputmode="decimal"
                  autocomplete="off"
                  autocorrect="off"
                  type="number"
                  pattern="^[0-9]*[.]?[0-9]*$"
                  placeholder="0.0"
                  minlength="1"
                  maxlength="79"
                  spellcheck="false"
                />
                <div class="h-32px flex items-center">
                  <img
                    class="token-icon w-30px h-30px"
                    src={images.bpt}
                    alt="ETH"
                  />
                  <span class="py-2px px-4px">BPT</span>
                </div>
              </div>
            </div>

            {#if stakeAmount == 0 }
              <button disabled class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Enter an amount</button>
            {:else}
              {#if parseEther(stakeAmount).gt(data.userTokenApproval)}
              <button on:click={approve} class="btn clear stake-button mt-10px rounded-20px p-15px w-100pcborder-white">Approve</button>
              {:else}
                <button on:click={stake} class="btn clear stake-button mt-10px rounded-20px p-15px w-100pcborder-white">Stake</button>
              {/if}
            {/if}
          </span>
      
          <span class="flex flex-col md:flex-row mt-4 justify-between">
            <span class="w-100pc md:mr-1 md:w-1/2">
              <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Rewards available to claim</div>
                  <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                    <div class="h-32px flex items-center">
                      <img
                        class="token-icon w-30px h-30px"
                        src={images.doughtoken}
                        alt="DOUGH"
                      />
                      <span class="py-2px px-4px text-black">DOUGH</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-between p-1 mt-2">
                  <div class='font-bold flex items-center'>
                    <span>{Number(formatEther(data.userUnclaimed.mul(data.escrowPercentage).div(parseEther("1")))).toFixed(4)}</span>
                    <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-1 font-bold">Escrow</span>
                  </div>
                  <div class='font-bold flex items-center'>
                  <span>{Number(formatEther(data.userUnclaimed.sub(data.userUnclaimed.mul(data.escrowPercentage).div(parseEther("1"))))).toFixed(4)}</span>
                    <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-1 font-bold">Liquid</span>
                  </div>
                
  
                </div>
              </div>

              {#if data.userUnclaimed.eq(0)}
                <button disabled class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">No rewards available</button>
              {:else}
                <button on:click={claim} class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Claim</button>
              {/if}
            </span>
      
            <span class="w-100pc mt-8 md:mt-0 md:mr-1 md:w-1/2">
              <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white">
                <div class="flex items-center justify-between">
                  <div class="flex nowrap intems-center p-1 font-thin">Amount to Unstake</div>
                  <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
                    <button on:click={() => {unstakeAmount = formatEther(data.userDeposited)}} class="oven-withdraw-button">100%</button>
                  </div>
                </div>
                <div class="flex nowrap items-center p-1">
                  <input
                    bind:value={unstakeAmount}
                    class="swap-input-from"
                    inputmode="decimal"
                    autocomplete="off"
                    autocorrect="off"
                    type="number"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    placeholder="0.0"
                    minlength="1"
                    maxlength="79"
                    spellcheck="false"
                  />
                  <div class="h-32px flex items-center">
                    <img
                      class="token-icon w-30px h-30px"
                      src={images.bpt}
                      alt="ETH"
                    />
                    <span class="py-2px px-4px">BPT</span>
                  </div>
                </div>
              </div>

              {#if unstakeAmount == 0 }
                  <button disabled class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Enter an amount</button>
              {:else}
                <button on:click={unstake} class="clear farm-button-ghost mt-10px rounded-20px p-15px w-100pc border-grey hover:bg-black hover:text-white">Unstake</button>
              {/if}
              
            </span>
      
          </span>
      
          <div class="info-box mt-4 mb-8">
            <h1 class="text-xl text-left font-bold">Info</h1>
            <p>
              <strong>YPIE/ETH</strong> Staking Rewards - the pool will keep receiving <strong>{Number(formatEther(data.rewardRate.mul(45371))).toFixed(4)}</strong> DOUGH as nominal
              weekly reward distributed to LPs, of which <strong>{data.liquidPercentageLabel}</strong> distributed liquid along the week <strong>{data.escrowPercentageLabel}</strong> escrowed
              within the staking contract, and subject to 52 weeks vesting from the moment they will be claimed.
            </p>
            <br />
            <p>There are total : <strong>{Number(formatEther(data.totalDeposited)).toFixed(4)} {stakingPool.stakingTokenSymbol} </strong> staked in the Staking contract.</p>
            <p>Staked by you: <strong>{Number(formatEther(data.userDeposited)).toFixed(4)} {stakingPool.stakingTokenSymbol}</p>
            <p>
              You are staking : <strong>{data.userDeposited.eq(0) ? "0" : formatEther(data.userDeposited.div(data.totalDeposited).mul(100))}%</strong>
            </p>
            {#if data.exitFeePercentage.gt(0)}
                <p>
                  ⚠️ This staking pool has a <strong>{formatEther(data.exitFeePercentage.mul(100))}%</strong> exit fee charged on your principal on exit
                </p>
            {/if}
            <br />
            <p>
              You can add liquidity and get {stakingPool.stakingTokenSymbol} tokens
              <a target="_blank" href="{stakingPool.lpLink}">here</a>
            </p>
            <p>Weekly rewards for this pool are <strong>{Number(formatEther(data.rewardRate.mul(45371))).toFixed(4)}</strong></p>
          </div>
        </span>
      </div>
    </div>
    </div>
</div>