<script>
    export let value;
</script>

{#if value === '-' || value === null}
    n/a
{:else}
    {#if value > 0}
        <span class="text-green">▲ {value.toFixed(2)}% 24h</span>
    {:else if value == 0}
        {value.toFixed(2)}% 24h
    {:else}
        <span class="text-red">▼ {value.toFixed(2)}% 24h</span>
    {/if}
{/if}
