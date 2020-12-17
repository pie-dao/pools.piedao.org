<script>
import poolsConfig from '../config/pools.json';
import PieIndexLanding from './PieIndexLanding.svelte';
import ExperiPie from './ExperiPie.svelte';

export let params;


$: isExperipie = poolsConfig[params.address].isExperipie;
$: console.log('isExperipie', isExperipie)
</script>

{#if isExperipie === true}
    <ExperiPie params={{address: params.address}} />
{:else}
    <PieIndexLanding params={{address: params.address}} />
{/if}

