<script>
  import images from "../../config/images.json";
  import { getTokenImage } from '../helpers.js';

  export let doughInEscrow;
  export let escrowEntries;
  export let pools;
  
</script>

<span class="-mt-20px">
  <a class="" href="https://snapshot.page/#/piedao" target="_blank"><img width="20px" height="20px" class="ml-auto relative top-40px right-20px" src={images.extLink} alt="external link icon" /></a>

  <div class="bg-lightgreen rounded-xl text-black pt-8 pb-2 md:py-8 px-2 md:px-6">
    <div class="font-huge text-center">Farm Positions</div>

    <div class="flex">

      <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-6 mr-1 md:mr-2 w-1/2">
        <div class="flex items-center mr-4 text-xl">💰
          <!-- <img class="" width="40px" height="40px" src={images.doughtoken} alt="token name" /> -->
        </div>
        <div class="flex flex-col justify-around">
            <span class="text-xs font-thin opacity-80">DOUGH in Escrow</span>
            <span class="font-bold leading-6">{doughInEscrow || 0}</span>
        </div>
      </div>

      <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-4 mt-6 ml-1 md:ml-2 w-1/2">
        <div class="flex items-center mr-4 text-xl">🧮
          <!-- <img class="" width="40px" height="40px" src={images.doughtoken} alt="token name" /> -->
        </div>
        <div class="flex flex-col justify-around">
            <span class="text-xs font-thin opacity-80">Vesting Entries</span>
            <span class="font-bold leading-6">{escrowEntries || 0 }</span>
        </div>
      </div>

    </div>
    
    {#if pools.length > 0 }
      {#each pools as stakingPool}
        <a href={`#/staking/${stakingPool.slug}`}>
          <div class="flex items-center rounded md:rounded-xl bg-white p-2 md:p-6 mt-2 md:mt-4">
            <div class="flex items-center mr-4">
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
            <div class="flex flex-col justify-around">
              <span class="md:text-lg font-bold leading-6">{stakingPool.name}</span>
              <span class="text-xs font-thin opacity-80">Staked</span>
              <span class="text-xs font-thin opacity-80">Rewards</span>
            </div>
            <div class="flex flex-col justify-around text-right ml-auto font-thin">
              <!-- <span><span class="bg-darkpurple font-bold text-white px-5px py-1px roundedxs text-xs">55.30% APY</span></span> -->
              <span class="text-xs font-thin opacity-80">{stakingPool.userDeposited} {stakingPool.stakingTokenSymbol}</span>
              <span class="text-xs font-thin opacity-80">{stakingPool.userUnclaimed} DOUGH</span>
            </div>
          </div>
        </a>
      {/each}
    {/if}
    
  </div>
</span>

