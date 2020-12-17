<script>
import poolsConfig from "../../config/pools.json";
import LiquidityModal from './LiquidityModal.svelte';
import ExperiPieLiquidityModal from './ExperiPieLiquidityModal.svelte';

export let token;
export let poolAction;
export let method; // NOTE: This really should be named poolAddress. Token is too generic.;


$: isExperipie = poolsConfig[token].isExperipie;
$: console.log('isExperipie', isExperipie)
</script>

{#if isExperipie === true}
    <ExperiPieLiquidityModal 
        token={token} 
        method={method} 
        poolAction={poolAction}
    />
{:else}
    <LiquidityModal 
        token={token} 
        method={method} 
        poolAction={poolAction}
    />
{/if}
    
    