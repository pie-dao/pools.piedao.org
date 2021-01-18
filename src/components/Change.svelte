<script>
    export let value;
    export let showLabel;

    $: displayLabel = showLabel || false;
</script>

{#if value === '-' || value === null}
    n/a
{:else}
    {#if value > 0}
        <span class="text-green">▲ {value.toFixed(2)}% 
        {#if displayLabel}
        24h
        {/if}
        </span>
    {:else if value == 0}
        {value.toFixed(2)}% 
        {#if displayLabel}
        24h
        {/if}
    {:else}
        <span class="text-red">▼ {value.toFixed(2)}% 
        {#if displayLabel}
        24h
        {/if}</span>
    {/if}
{/if}
