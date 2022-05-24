<script>
    import { BigNumber, ethers } from "ethers";
    import { formatEther, parseEther } from '@ethersproject/units';
    import Meta from '../components/elements/meta.svelte';
    import stakingPools from '../config/stakingPools.json';
    import rewardEscrowABI from '../config/rewardEscrowABI.json';
    import images from "../config/images.json";
    import {
      eth,
    } from "../stores/eth.js";
    import { get } from "svelte/store";

    let doughInEscrow = "n/a";
    let escrowEntries = "n/a";

    const fetchRewardEscrowData = async () => {
        const address = $eth.address

        if(!address) {
            return;
        }

        const { provider, signer } = get(eth);

        const rewardEscrow = new ethers.Contract('0x63cbd1858bd79de1a06c3c26462db360b834912d', rewardEscrowABI,  signer || provider);

        doughInEscrow = Number(formatEther(await rewardEscrow.totalEscrowedAccountBalance(address))).toFixed(4);
        escrowEntries = (await rewardEscrow.numVestingEntries(address)).toString();
    }

    fetchRewardEscrowData();

    // update data on address or block change
    $: if($eth.address || $eth.currentBlockNumber) {
      $eth.address || !$eth.signer
      fetchRewardEscrowData();
    };

</script>
<Meta 
metadata={{
    title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
    description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI++ / ETH are all incentivized."
}}
/>

<div class="content flex flex-col">
    <img class="banner-desktop" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4.png" />
    <img class="banner-mobile" src="https://raw.githubusercontent.com/pie-dao/brand/master/misc/amazingrewards4-mobile.png" />
    <div class="liquidity-container flex flex-col align-center bg-grey-243 rounded-4px p-4 my-0 md:p-6 w-full">

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
                            {doughInEscrow}
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
                            {escrowEntries}
                          </p>
                        </div>
                      </div>
                    </div>
        
                  </div>
          </main>
        </div>
        {/if}
        
        <h1 class="mt-8 mb-1 px-2 text-center text-lg md:text-xl">Select a pool</h1>
        <div class="flex flex-col w-full flex-wrap justify-center md:flex-row">
            {#each stakingPools as stakingPool}
                <div class="farming-card flex flex-col justify-center align-center items-center text-center mx-2 my-2 md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
                    <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
                    <div class="title text-lg"> {stakingPool.name} </div>
                    <!-- <div class="subtitle font-thin">{ammPool.description}</div> -->
                    <!-- <div class="apy">{ammPool.weeklyRewards} {ammPool.rewards_token}</div> -->
                    <!-- <div class="apy"> <a href={ammPool.poolLink} target="_blank"> {ammPool.platform} </a></div> -->
                    <div class="apy">
                        {stakingPool.stakingTokenName}
                    </div>
                        <a href="#/staking/{stakingPool.slug}" class="btn border-white clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</a>
                </div>
            {/each}
        </div>
    </div>
</div>