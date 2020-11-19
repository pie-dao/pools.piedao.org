<script>
    export let value;
</script>

{#if value === '-'}
    n/a
{:else}
    {#if value > 0}
        <span class="text-green">▲ {value.toFixed(2)}%</span>
    {:else if value == 0}
        {value.toFixed(2)}%
    {:else}
        <span class="text-red">▼ {value.toFixed(2)}%</span>
    {/if}
{/if}
