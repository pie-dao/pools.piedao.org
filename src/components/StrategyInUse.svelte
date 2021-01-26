<script>
      import images from '../config/images.json';
      export let protocol;
</script>

{#if protocol === 'Aave'}
    <div class="flex justify-center items-center strategy-label bg-aave text-white"><img class="w-20px h-20px mr-10px" alt="strategy icon" src={images.aavewhite} />
        <span>Lending</span>
    </div> 
{:else if protocol === 'Compound'}
    <div class="flex justify-center items-center strategy-label bg-compound text-white"><img class="w-20px h-20px mr-10px" alt="strategy icon" src={images.compoundwhite} />
        <span>Lending</span>
    </div> 
{:else if protocol === 'C.R.E.A.M.'}
    <div class="flex justify-center items-center strategy-label bg-cream text-white"><img class="w-20px h-20px mr-10px" alt="strategy icon" src={images.creamwhite} />
        <span>Lending</span>
    </div>
{:else if protocol === 'SushiBar'}
    <div class="flex justify-center items-center strategy-label bg-cream text-white">
        <span class="w-20px h-20px mr-10px" alt="strategy icon">🍣</span>
        <span>Staking</span>
    </div>
{:else if protocol === 'yGOV'}
    <div class="flex justify-center items-center strategy-label bg-cream text-white">
        <span class="w-20px h-20px mr-10px" alt="strategy icon">😏</span>
        <span>Staking</span>
    </div>
{:else if protocol === 'none'}
    <div class="flex justify-center items-center strategy-label bg-grey text-white">
        <span class="w-20px h-20px mr-10px pl-1" alt="strategy icon">💤</span>
        <span class="pl-1">None</span>
    </div>
{/if}


