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

  import OvenCard from '../components/elements/oven-card.svelte';
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
  let amountToUnstake = 0;
  let isReady = false;
  
  const referral = $currentRoute.params.referral || window.localStorage.getItem('referral');


  $: needAllowance = true;
  $: ovens = [
    {
      addressOven: '0x5e8dffda3d69f01fa1aaf941e28f935d773db61a',
      deprecated: false,
      name: 'DEFI+L Oven',
      description: 'Bakes DEFI+L at Zero cost',
      baking: {
          symbol: "DEFI+L",
          address: "0x78f225869c08d478c34e5f645d07a87d3fe8eb78",
          balance: '0',
          icon: getTokenImage('0x78f225869c08d478c34e5f645d07a87d3fe8eb78')
      },
      highlight: true,
      enabled: true,
    }
  ]

  $: oven = null;

  $: if($eth.address) {
    if(isReady) {
      
    }

    if(!intiated) {
      const address = $eth.address;

      ovens.forEach( async p => {      
        //TODO get eth balance
        //TODO get Pie balance
        
      });
      intiated = true;
      bumpLifecycle();
    }
  }

</script>

<div class="content flex flex-col">
    <!-- <img class="banner-desktop" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4.png" />
    <img class="banner-mobile" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4-mobile.png" /> -->
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-0 md:p-6 w-full">    
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
