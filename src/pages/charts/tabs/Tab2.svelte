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

      let boostedLocksValue = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.boostedLocksValue), ',', '.', '')),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Boosted Locks',
        line: {
          width: 6,
          color: '#65D0F5',
        },
      };

      let depositedLocksValue = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.depositedLocksValue), ',', '.', '')),
        type: 'scatter',
        mode: 'lines',
        name: 'Deposited Locks',
        line: {
          width: 6,
          color: '#F8E71C',
        },
      };

      let ejectedLocksValue = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.ejectedLocksValue), ',', '.', '')),
        type: 'scatter',
        mode: 'lines',
        name: 'Ejected Locks',
        line: {
          width: 6,
          color: '#F005C4',
        },
      };

      let withdrawnLocksValue = {
        x: dates,
        y: stats.map(stat => formatFiat(toNum(stat.withdrawnLocksValue), ',', '.', '')),
        type: 'scatter',
        mode: 'lines',
        name: 'Withdrawn Locks',
        line: {
          width: 6,
          color: '#4af2a1',
        },
      };        

      var data = [boostedLocksValue, depositedLocksValue, ejectedLocksValue, withdrawnLocksValue];

      new Plotly.newPlot(chartId, data, layout, settings);
    } catch (error) {
      console.error(error);
    }
  });  
</script>

<div id={chartId}></div>