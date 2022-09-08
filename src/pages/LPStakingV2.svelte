<script>
  import { onMount } from 'svelte';
  import { get } from "svelte/store";
  import { ethers } from "ethers";
  import { formatEther } from '@ethersproject/units';
  import find from 'lodash/find';
	import { getTokenImage } from './../components/helpers.js';

  import stakingPools from '../config/stakingPools.json';
  import smartcontracts from '../config/smartcontracts.json';
  import stakingPoolsABI from '../abis/stakingPoolsABI.json';
  import { eth } from "../stores/eth.js";
  import Farming from '../components/piefolio/Farming.svelte';
  import Meta from '../components/elements/meta.svelte';

  let userPools = [];

  $: initialised = false;

  stakingPools.map( p => {
      p.escrowPercentage = 'n/a';
      p.liquidPercentage = 'n/a';
      p.withdrawFee = 'n/a';
      return p;
  });

  const getEscrowPercentages = async (poolId) => {
      const { provider, signer } = get(eth);
      const stakingContract = new ethers.Contract(smartcontracts.stakingPools, stakingPoolsABI,  signer || provider);
      return Number(formatEther(await stakingContract.getPoolEscrowPercentage(poolId))) * 100;
  }

  const getPoolsUser = async () => {
      const { provider, signer } = get(eth);
      const stakingContract = new ethers.Contract(smartcontracts.stakingPools, stakingPoolsABI,  signer || provider);
      let pools = await stakingContract.getPools($eth.address);
      const res = [];
      
      let poolId = 0;
      for (const p of pools) {
      if (p.userDeposited.gt(0)) {
        const userPool = {
          ...find(stakingPools, (p) => p.id === poolId.toString()),
          id: poolId,
          userDeposited: Number(formatEther(p.userDeposited)).toFixed(4),
          totalDeposited: Number(formatEther(p.totalDeposited)).toFixed(4),
          userUnclaimed: Number(formatEther(p.userUnclaimed)).toFixed(4),
        };
        res.push(userPool);
      }
        poolId++;
      }

      userPools = res;
  }

  const fetchEscrowPercentages = async () => {
    for (const p of stakingPools) {
      const percentage = await getEscrowPercentages(p.id);
      if( percentage !== undefined) {
        p.escrowPercentage = `${percentage}%`;
        p.liquidPercentage = `${100 - percentage}%`;
      }
    }
  }

  onMount( async () => {
    await fetchEscrowPercentages();
    initialised = true;
  })

  // update data on address or block change
  $: if($eth.address || $eth.currentBlockNumber) {
    $eth.address || !$eth.signer
    getPoolsUser()
  };

  
</script>

<Meta 
    metadata={{
        title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
        description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI++ / ETH are all incentivized."
    }}
/>
    
<div class="w-100pc m-0 p-0 flex justify-center items-center">
  <div class="w-100pc lg:max-w-1280px flex flex-col-reverse lg:flex-row items-center lg:items-start justify-center py-0 md:py-8 px-2"> 
        <div class="flex flex-col w-100pc lg:w-45pc lg:mr-2pc">
          <span class="mt-0 md:mt-0 mb-2">
            <!-- Farms List -->
            <div class="w-100pc flex flex-col cardbordergradient">
              <div class="w-100pc bg-lightgrey rounded-xl text-black pt-8 pb-2 md:pt-8 pb-6 px-2 md:px-6 flex flex-col items-center">
                <div class="w-100pc font-huge text-center md:text-left">Farm Pools</div>
                {#if initialised === true }
                <!-- svelte-ignore a11y-missing-attribute -->
                  {#each stakingPools as stakingPool}
                    <a href={`#/staking/${stakingPool.slug}`} class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                      <div class="mr-4 flex items-center">

                        {#each stakingPool.containing as asset, i}
                          <img
                            class={i === 0 ? "z-10" : "-ml-20px"}
                            width="40px"
                            height="40px"
                            src={getTokenImage(asset.address)}
                            alt="token name"
                          />
                        {/each}
                      </div>
                      <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                        <div class="w-100pc flex items-center justify-between md:justify-start">
                          <span class="md:text-lg leading-6">{stakingPool.name}</span>
                          <!-- <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span> -->
                        </div>
                        <span class="text-sm font-thin">{stakingPool.liquidPercentage} Liquid - {stakingPool.escrowPercentage} Escrowed</span>
                      </div>
                      <div class="flex flex-col justify-around text-right ml-auto font-thin">
                        <span class="text-sm md:text-lg leading-6 hidden md:block capitalize">{stakingPool.type}</span>
                        <!-- <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span> -->
                      </div>
                    </a>
                  {/each}
                {:else}
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <div class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">Loading pools</span>
                      <!-- <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span> -->
                    </div>
                    <span class="text-sm font-thin">... ... ...</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block capitalize">⏳</span>
                    <!-- <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span> -->
                  </div>
                </a>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <div class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">Loading pools</span>
                      <!-- <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span> -->
                    </div>
                    <span class="text-sm font-thin">... ... ...</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block capitalize">⏳</span>
                    <!-- <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span> -->
                  </div>
                </a>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="flex mt-4 w-100pc rounded md:rounded-xl bg-white p-2 md:p-4 pointer">
                  <div class="mr-4 flex items-center">
                    <img
                      class="z-10"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                    <img
                      class="-ml-20px"
                      width="40px"
                      height="40px"
                      src='https://raw.githubusercontent.com/pie-dao/brand/329c5f1b348cd47a68eec12a71f06727398e789e/misc/generic-token.svg'
                      alt="token name"
                    />
                  </div>
                  <div class="flex flex-col justify-around flex-grow md:flex-grow-0">
                    <div class="w-100pc flex items-center justify-between md:justify-start">
                      <span class="md:text-lg leading-6">Loading pools</span>
                      <!-- <span class="bg-darkpurple text-white px-5px py-1px roundedxs text-xs ml-2">55.30% APY</span> -->
                    </div>
                    <span class="text-sm font-thin">... ... ...</span>
                  </div>
                  <div class="flex flex-col justify-around text-right ml-auto font-thin">
                    <span class="text-sm md:text-lg leading-6 hidden md:block capitalize">⏳</span>
                    <!-- <span class="text-sm px-1 text-grey hidden md:block">Tot 166.345 BPT Staked</span> -->
                  </div>
                </a>
                {/if}
    
              </div>
            </div>
            <div class="text-center font-thin w-100pc mt-4 hover:opacity-60">
              <a href="https://legacy.piedao.org/#/lp-legacy-farm">Cannot find your pool? <strong>Go to old farms!</strong></a>
            </div>
            <div class="text-center font-thin w-100pc mt-4 hover:opacity-60">
              <a href="https://vfat.tools/piedao/" target="_blank">Looking for APR? <strong>Go to 👨‍🌾 vfat.tools!</strong></a>
            </div>
          </span>
        </div>
        <!-- YOUR FARMING POSITIONS -->
        <div class="flex flex-col w-100pc lg:w-45pc">
          <span class="mt-2 mb-2 md:mb-1">
            {#if $eth.address}
            <Farming
              pools={userPools}
            />
            {:else}
            <div class="mt-20px">            
              <div class="bg-lightgreen rounded-xl text-black pt-8 pb-2 md:py-8 px-2 md:px-6">
                <div class="font-huge text-center">Farm Positions</div>
                <div class="flex flex-col items-center">
                  <span class="w-full text-xs text-center font-thin opacity-80">Connect Web3 to see your positions</span>
                  <img
                  class="z-10 mt-4"
                  width="150px"
                  src='https://raw.githubusercontent.com/pie-dao/brand/master/misc/stakemoji.png'
                  alt="farmer"
                />
                  </div>
                  </div>
                </div>
            {/if}
          </span>
        </div>
      </div>
    </div>
    
    <!-- FAQ -->
    <!-- <div class="content">
      <div class="flex flex-col items-start mx-0 md:mx-4 w-100pc md:max-w-1280px">
        <div class="w-100pc font-huge text-center mb-4">Got questions?</div>
    
        <AccordionGroup>
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>
              How does meta-governance work?
              </button>
            <div class="accordioncontent">
              With meta-governance users can participate in governance across the DeFi ecosystem with
              just one ERC-20, our governance token DOUGH. This occurs gas-free via Snapshot, with DOUGH
              holders signalling their support for a proposal and the DAO enacting their will using all
              the held funds.
            </div>
          </Accordion>
    
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle}>
              Can I still migrate my tokens?
            </button>
            <div class="accordioncontent">
              To make the process as simple as possible an Aragon app will be installed which allows you
              to migrate your tokens.<br />
              By visiting the Aragon interface of PieDAO and opening the migration app you can easily migrate
              your already vested tokens to DOUGH v2. The interface will automatically fill in the maximum
              amount you are able to migrate.<br />
              <a
                class="font-bold mt-4 md:mt-4"
                target="_blank"
                href={`https://medium.com/piedao/dough-farming-season-7329ea5e84dd`}
                >Migration Tutorial</a>
                <br />
              <a
                class="font-bold mt-4 md:mt-4"
                target="_blank"
                href={`https://client.aragon.org/?#/piedao/0x968986e7ab9d05b4f6334efdc6c4c5efd89d4119/`}
                >Migrate Now</a>
            </div>
          </Accordion>
    
          <Accordion class="flex flex-col">
            <button class="accordionbutton flex flex-col" slot="header" let:toggle on:click={toggle} >
              How long is the vesting period?
              </button>
            <div class="accordioncontent">
              <div class="mt-2 md:mt-4">
                With the imminent migration to the DOUGH v2 governance token and the launch of the DOUGH
                / ETH liquidity pool on Balancer, PieDAO will also open its DOUGH farming season!
              </div>
    
              <div class="mt-2 md:mt-4">
                <strong>Incentives: </strong>60,000,000 DOUGH v2 tokens (60% of total) will be locked in
                a vault off-circulation and assigned to the DAO to promote its development overtime
                through liquidity mining programs and other incentives.
              </div>
    
              <div class="mt-2 md:mt-4">
                <strong>Eligibility: </strong>All Liquidity Providers to selected pools will be eligible
                for these incentive programs by staking their LP tokens to PieDAO staking contract.
              </div>
            </div>
          </Accordion>
        </AccordionGroup>
      </div> 
    </div>
  -->
