<script>
  import { onMount } from 'svelte';
  
  import AllocationChart from './AllocationChart.svelte';
  import pools from '../config/pools.json';

  export let token;
  export let leftWidth;

  export let labelsHeight;
  export let rightHeight;

  $: values = pools[token].composition;
  $: leftHeight = leftWidth;
  $: valuesMarginTop = (rightHeight - labelsHeight) / 2;

  $: valuesStyle = `margin-top: ${valuesMarginTop}px`;

  const bgColor = ({ color }) => `background-color: ${color};`;
</script>

<div class="allocation-breakdown-container">
  <h1>Allocation Breakdown</h1>
  <div class="row">
    <div class="left" bind:offsetWidth={leftWidth}>
      <AllocationChart height={leftHeight} width={leftWidth} margin={20} values={values} />
    </div>
    <div class="right" bind:offsetHeight={rightHeight}>
      <div class="labels" style={valuesStyle} bind:offsetHeight={labelsHeight}>
        {#each values as value}
          <p class="label" style={bgColor(value)}>
            {value.percentage}% {value.symbol}
          </p>
        {/each}
      </div>
    </div>
  </div>
</div>