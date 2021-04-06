<script>
    import Meta from '../components/elements/meta.svelte';
    import stakingPools from '../config/stakingPools.json';
</script>
<Meta 
metadata={{
    title: "PieDAO Farms, high yield DEFI farms to put your DEFI index to work",
    description: "An overview of the PieDAO farms, allowing users to stake their Pies and earn DOUGH. DOUGH / ETH, BCP, DEFI+S / ETH, DEFI+L / ETH are all incentivized."
}}
/>

<div class="content flex flex-col">
    {#each stakingPools as stakingPool}
        <a href="#/staking/{stakingPool.id}">{stakingPool.name}</a>
    {/each}

</div>