<script>
  import { _ } from 'svelte-i18n';

  import { onMount } from 'svelte';

  import AllocationChart from './AllocationChart.svelte';
  import poolsConfig from '../config/pools.json';

  import { pools } from '../stores/eth.js';
  import { amountFormatter, subscribeToPoolWeights } from './helpers.js';

  let defaultAllocation = true;
  export let token;
  export let leftWidth;

  export let labelsHeight;
  export let rightHeight;

  let balanceKeys = [];
  let values = [];

  //$: subscribeToPoolWeights(token);
  $: values = ((useConfig, storeValues) => {
    if (useConfig) {
      return poolsConfig[token].composition;
    }
    return storeValues;
  })(defaultAllocation, $pools[token]);
  $: leftHeight = leftWidth;
  $: valuesMarginTop = (rightHeight - labelsHeight) / 2;
  $: valuesStyle = `margin-top: ${valuesMarginTop}px`;

  const bgColor = ({ color }) => `background-color: ${color};`;
</script>

<div class="allocation-breakdown-container">
  <h1>
    {$_('general.allocation')}
    {$_('general.breakdown')}
    <button on:click={() => (defaultAllocation = !defaultAllocation)}>{defaultAllocation}</button>
  </h1>
  <div class="row">
    <div class="left" bind:offsetWidth={leftWidth}>
      <AllocationChart height={leftHeight} width={leftWidth} margin={20} {values} />
    </div>
    <div class="right" bind:offsetHeight={rightHeight}>
      <div class="labels" style={valuesStyle} bind:offsetHeight={labelsHeight}>
        {#each values as value}
          <p class="label" style={bgColor(value)}>
            {#if value.percentageUSD}
              {amountFormatter({ amount: value.percentageUSD, displayDecimals: 2 })}% {value.symbol}
            {:else}
              {amountFormatter({ amount: value.percentage, displayDecimals: 2 })}% {value.symbol}
            {/if}
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>
