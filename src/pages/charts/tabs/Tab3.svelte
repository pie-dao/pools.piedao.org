<script>
  import { onMount } from 'svelte'; 
  import uniqueId from 'lodash/uniqueId';
  import { formatFiat } from '../../../components/helpers.js';
  import { toNum } from '../../../helpers/staking.js';

  export let stats = [];

  // creating a unique chart id...
  let chartId = uniqueId('chart_');
  
  onMount(async () => {
    try {
      let timestamps = stats.map(stat => stat.id);
      let dates = timestamps.map(timestamp => new Date(timestamp * 1000).toLocaleString());   

      let layout = {
        autosize: true,
        margin: {
          pad: 20,
          l: 10,
          r: 70,
          t: 10,
          b: 80,
        },
        legend: {
          y: 1.5,
          x: 0.5,
          orientation: 'h',
          tracegroupgap: 8000,
        },
        yaxis: {
          fixedrange: false,
          zeroline: true,
          side: 'right',
        },
        xaxis: {
          fixedrange: false,
          zeroline: true,
          ticktext: dates,
          tickvals: timestamps,
          tickmode: 'array',
        },
      };

      let settings = {
        displayModeBar: false,
        responsive: false,
        scrollZoom: false
      };

      var totalDoughStaked = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.totalDoughStaked), ',', '.', '')),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Total Dough Staked',
        line: {
          width: 6,
          color: '#65D0F5',
        },
      };

      var veTokenTotalSupply = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.veTokenTotalSupply), ',', '.', '')),
        type: 'scatter',
        mode: 'lines',
        name: 'Total veDough Supply',
        line: {
          width: 6,
          color: '#F8E71C',
        },
      };

      var data = [totalDoughStaked, veTokenTotalSupply];

      new Plotly.newPlot(chartId, data, layout, settings);
    } catch (error) {
      console.error(error);
    }
  });  
</script>

<div id={chartId}></div>