<script>
  import { ethers } from "ethers";
  import { onMount } from 'svelte';
  import BigNumber from "bignumber.js";
  import { _ } from "svelte-i18n";
  import { get } from "svelte/store";
  import filter from "lodash/filter";

  import images from "../config/images.json";
  import { currentRoute } from '../stores/routes.js';
  import recipeUnipool from '../config/unipoolABI.json';
  import ovenABI from '../config/ovenABI.json';
  import displayNotification from "../notifications.js";
  import { piesMarketDataStore } from '../stores/coingecko.js';
  import OvenCard from '../components/elements/oven-card.svelte';
  import {
    maxAmount,
    getTokenImage,
    fetchEthBalance,
    fetchCalcToPie,
    formatFiat,
    subscribeToBalance
  } from "../components/helpers.js";
  import {
    balanceKey,
    balances,
    contract,
    eth
  } from "../stores/eth.js";

  let ethKey;
  let ethBalance = 0;
  let intiated = false;
  let amountToStake = 0;
  let amountToUnstake = 0;
  let isReady = false;
  let amount = "1.00000000";

  $: ovens = [
    {
      addressOven: '0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915',
      deprecated: false,
      name: 'DEFI++ Oven',
      description: 'Bakes DEFI++ at Zero cost',
      data: {
        ethBalance: 0,
        pieBalance: 0
      },
      baking: {
          symbol: "DEFI++",
          address: "0x8d1ce361eb68e9e05573443c407d4a3bed23b033",
          balance: '0',
          icon: getTokenImage('0x8d1ce361eb68e9e05573443c407d4a3bed23b033')
      },
      highlight: true,
      enabled: true,
    }
  ]

  $: oven = null;

  $: if($eth.address) {
    fetchEthBalance($eth.address);
    ethKey = balanceKey(ethers.constants.AddressZero, $eth.address);
  }

  $: ethBalance = BigNumber($balances[ethKey]).toString();

  $: if($eth.address) {
    if(isReady) {
      
    }

    if(!intiated) {
      const address = $eth.address;

      ovens.forEach( async o => {      
        o.instance = await contract({ address: o.addressOven, abi: ovenABI });
        o.data.ethBalance = await o.instance.ethBalanceOf($eth.address) / 1e18;
        o.data.pieBalance = await o.instance.outputBalanceOf($eth.address) / 1e18;
        o.cap = await o.instance.cap() / 1e18;
      });

      console.log('ovens', ovens);
      intiated = true;
    }
  }

  const withdrawPie = async () => {
    const requestedAmount = BigNumber(amount);
    const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }
    const { emitter } = displayNotification(await oven.withdrawOutput($eth.address) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ${oven.baking.symbol} successfully withdrew from the Oven`,
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
  };

  const withdrawEth = async () => {
    const requestedAmount = BigNumber(amount);
    const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }
    const { emitter } = displayNotification(await oven.withdrawAllETH($eth.address) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ETH successfully withdrew from the Oven`,
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
  };

  const deposit = async () => {
    const requestedAmount = BigNumber(amount);
    const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }


    if (BigNumber(requestedAmount).isGreaterThan(BigNumber(max)) ) {
      const maxFormatted = amountFormatter({ amount: max, displayDecimals: 8 });
      const message = `Not enough ETH`;
      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    let overrides = {
      gasLimit: 3000000
    }

    const { emitter } = displayNotification(await oven.deposit(amountWei) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ETH successfully deposited in the Oven`,
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
  };

</script>

<div class="content flex flex-col">
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-0 md:p-6 w-full">    

        ethBalance {ethBalance}
        {#if !oven}
        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">♨️ Select an Oven</h1>
        <div class="flex flex-col w-full justify-center md:flex-row">
            {#each filter(ovens, { deprecated: false }) as ammPool}
              <OvenCard 
                title={ammPool.name}
                subTitle={"90% Full"}
                image={images.logos.piedao_clean}
                description={ammPool.description}
                callback={(ammPool) => {
                  oven = ammPool;
                }}
                isHighlighted={ammPool.highlight}
              />
            {/each}
        </div>
        {:else}
            <div>
              <button on:click={() => oven = null } class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</button>
              <button on:click={() => exit() } class="float-right btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Withdraw ETH & Tokens</button>
            </div>

            <div class="flex flex-col w-full justify-around md:flex-row">
              <!-- UNSTAKE BOX -->
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.withdraw} alt="PieDAO logo" />
                    <div class="title text-lg">Baked Tokens</div>
                    <div class="apy">
                      10 DEFI+L
                    </div>
                    <div class="subtitle font-thin">Avaiable to withdraw</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to withdraw</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input bind:value={amountToUnstake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button on:click={() => {
                                    amountToUnstake = 0;
                                  }} class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>            
                    </div>
                    {#if amountToUnstake === 0 }
                        <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
                    {:else}
                      <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Withdraw</button>
                    {/if}
                    
              </div>

              <!-- STAKE BOX -->
              <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.stake} alt="PieDAO logo" />
                    <div class="title text-lg"> ETH TO BAKE</div>
                    <div class="apy">
                      Oven is 90% full
                    </div>
                    <div class="subtitle font-thin">BALANCE</div>
                    <div class="apy text-sm">100ETH</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="text-black left black float-left">{$_('general.amount')}</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input bind:value={amountToStake} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button on:click={() => {
                                    amountToStake = 0;
                                  }} class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>           
                    </div>
                    <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Add ETH</button>
              </div>

            </div>
        {/if}    
</div>
</div>
