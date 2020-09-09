<script>
  import { _ } from "svelte-i18n";
  import images from "../config/images.json";
  import { currentRoute } from '../stores/routes.js';

  const incentivizedPools = [
    {
      address: '0x1',
      name: 'Uniswap Pool',
      description: 'WEEKLY REWARDS',
      weeklyRewards: 10000,
      apy: 1.8,
      needsApproval: true,
    },
    {
      address: '0x2',
      name: 'Balancer Pool',
      weeklyRewards: 10000,
      description: 'somethign goes here',
      apy: 1.8,
      needsApproval: false,
    },
  ]

  $: pool = incentivizedPools[0];
  $: console.log(pool);
</script>



<div class="content flex flex-col">
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-4 md:p-6 w-full">

        {#if !pool}
        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">Select a pool</h1>
        <div class="flex flex-col w-full justify-center md:flex-row">
            {#each incentivizedPools as ammPool}
              <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                  <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                  <div class="title text-lg"> {ammPool.name}</div>
                  <div class="subtitle font-thin">{ammPool.description}</div>
                  <div class="apy">{ammPool.weeklyRewards} DOUGH</div>
                  <button on:click={() => pool = ammPool } class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
              </div>
            {/each}
        </div>
        {:else}
            <div>
              <button on:click={() => pool = null } class="md:w-1 float-left btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Go back</button>
              <button on:click={() => pool = null } class="float-right btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim and Unstake</button>
            </div>

            <div class="flex flex-col w-full justify-around md:flex-row">
              <!-- UNSTAKE BOX -->
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg">UNSTAKE</div>
                    <div class="subtitle font-thin">STAKED BALANCE</div>
                    <div class="apy">0.00000 UNI</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to unstake</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input type="text" class="font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button class="py-2px px-4px">MAX</button>
                            </div>
                        </div>            
                    </div>
                    <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Unstake</button>
              </div>

              <!-- STAKE BOX -->
              <div class="farming-card highlight-box flex flex-col justify-center align-center items-center mx-1 my-4  border border-grey border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> STAKE</div>
                    <div class="subtitle font-thin">BALANCE</div>
                    <div class="apy">0.00000 UNI</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to stake</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input type="text" class="font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button class="text-black py-2px px-4px">MAX</button>
                            </div>
                        </div>           
                    </div>
                    {#if pool.needsApproval}
                      <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Approve</button>
                    {:else}
                      <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4 border-white">Stake</button>
                    {/if}
              </div>

              <!-- CLAIM BOX -->
              <div class="farming-card flex flex-col justify-center align-center items-center mx-1 my-4  border border-gray border-opacity-50 border-solid rounded-sm py-2">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg">REWARDS AVAILABLE</div>
                    <div class="subtitle font-thin">STAKED BALANCE</div>
                    <div class="apy">2.7463 DOUGH</div>
                    <div class="w-80 input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
                        <div class="top h-24px text-sm font-thin px-4 py-4 md:py-2">
                            <div class="left float-left">{$_('general.amount')} to claim</div>
                        </div>
                        <div class="bottom px-4 py-4 md:py-2">
                            <input type="text" class="font-thin text-base w-60pc md:w-75pc md:text-lg">
                            <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex align-middle justify-center items-center pointer mt-0">
                                <button class="py-2px px-4px">MAX</button>
                            </div>
                        </div>            
                    </div>
                    <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Claim</button>
              </div>
            </div>
        {/if}
    </div>

</div>
