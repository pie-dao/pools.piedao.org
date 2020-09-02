<script>
  import { _ } from "svelte-i18n";

  import { onMount } from "svelte";

  import AllocationChart from "./AllocationChart.svelte";
  import poolsConfig from "../config/pools.json";

  import { pools } from "../stores/eth.js";
  import { amountFormatter, subscribeToPoolWeights } from "./helpers.js";

  export let token;
  export let leftWidth;

  export let labelsHeight;
  export let rightHeight;

  let balanceKeys = [];

  //$: subscribeToPoolWeights(token);
  $: values = $pools[token] || poolsConfig[token].composition;
  $: leftHeight = leftWidth;
  $: valuesMarginTop = (rightHeight - labelsHeight) / 2;
  $: valuesStyle = `margin-top: ${valuesMarginTop}px`;

  const bgColor = ({ color }) => `background-color: ${color};`;
</script>

<div class="allocation-breakdown-container">
  <h1>{$_('general.allocation')} {$_('general.breakdown')}</h1>
  <div class="row">
    <div class="left" bind:offsetWidth={leftWidth}>
      <AllocationChart height={leftHeight} width={leftWidth} margin={20} {values} />
    </div>
    <div class="right" bind:offsetHeight={rightHeight}>
      <div class="labels" style={valuesStyle} bind:offsetHeight={labelsHeight}>
        {#each values as value}
          <p class="label" style={bgColor(value)}>
            {amountFormatter({ amount: value.percentage, displayDecimals: 2 })}% {value.symbol}
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>
