<script>
    import Meta from '../components/elements/meta.svelte';
    import stakingPools from '../config/stakingPools.json';
    import images from "../config/images.json";
    import { _ } from "svelte-i18n";

    export let params;

    console.log(params);

    const poolId = params[1];

    const stakingPool = stakingPools.find((item) => item.id == poolId);

    console.log(stakingPool);

    let amountToUnstake = 0;
    let needAllowance = false;

    let stakeAmount = 0;
    let unstakeAmount = 0;
</script>
<Meta 
metadata={{
    title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
    description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
}}
/>

<div class="content flex flex-col">

    <a href="#/staking" class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</a>

    <div class="flex flex-col w-full justify-around md:flex-row">
        <!-- UNSTAKE BOX -->
        <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.withdraw} alt="PieDAO logo" />
              <div class="title text-lg">UNSTAKE</div>
              <div class="apy">
                x
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
                          <button on:click={() => {}} class="text-black py-2px px-4px">MAX</button>
                      </div>
                  </div>            
              </div>
              {#if amountToUnstake === 0 }
                  <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
              {:else}
                <button on:click={() => console.log("lol")} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Unstake</button>
              {/if}
              
        </div>

        <!-- STAKE BOX -->
        <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.stake} alt="PieDAO logo" />
              <div class="title text-lg"> STAKE</div>
              <div class="apy">
               
              </div>
              <div class="subtitle font-thin">BALANCE</div>
              <div class="apy text-sm"></div>
              <div class="w-100pc input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                  <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                      <div class="text-black left black float-left">{$_('general.amount')} to stake</div>
                  </div>
                  <div class="bottom px-4 py-4 md:py-2">
                      <input bind:value={stakeAmount} type="text" class="text-black font-thin text-base w-60pc md:w-75pc md:text-lg">
                      <div class="text-black asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                          <button on:click={() => { console.log("click")
                            }} class="text-black py-2px px-4px">MAX</button>
                      </div>
                  </div>           
              </div>
              {#if needAllowance }
                <button on:click={ () => console.log('lol')} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Approve</button>
              {:else}
                {#if stakeAmount === 0 }
                  <button disabled class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Enter an amount</button>
                {:else}
                  <button on:click={() => console.log('lol')} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Stake</button>
                {/if}
              {/if}
        </div>

        <!-- CLAIM BOX -->
        <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm p-4">
              <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.claim} alt="PieDAO logo" />
              <div class="title text-lg">REWARDS AVAILABLE</div>
              <div class="subtitle font-thin">TO CLAIM</div>
              <div class="apy">
               0
              </div>
              
              <button on:click={() => console.log("lol")} class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim</button>
        </div>
    </div>
</div>
