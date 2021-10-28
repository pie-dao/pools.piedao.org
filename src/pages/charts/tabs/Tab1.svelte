<script>
  import { onMount } from 'svelte'; 
  import uniqueId from 'lodash/uniqueId';

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

      let boostedLocksCounter = {
        x: dates,
        y: stats.map(stat => stat.boostedLocksCounter),
        type: 'scatter',
        mode: 'lines',
        name: 'Boosted Locks',
        line: {
          width: 6,
          color: '#65D0F5',
        },
      };

      let depositedLocksCounter = {
        x: dates,
        y: stats.map(stat => stat.depositedLocksCounter),
        type: 'scatter',
        mode: 'lines',
        name: 'Deposited Locks',
        line: {
          width: 6,
          color: '#F8E71C',
        },
      };

      let ejectedLocksCounter = {
        x: dates,
        y: stats.map(stat => stat.ejectedLocksCounter),
        type: 'scatter',
        mode: 'lines',
        name: 'Ejected Locks',
        line: {
          width: 6,
          color: '#F005C4',
        },
      };

      let withdrawnLocksCounter = {
        x: dates,
        y: stats.map(stat => stat.withdrawnLocksCounter),
        type: 'scatter',
        mode: 'lines',
        name: 'Withdrawn Locks',
        line: {
          width: 6,
          color: '#4af2a1',
        },
      };      

      var data = [boostedLocksCounter, depositedLocksCounter, ejectedLocksCounter, withdrawnLocksCounter];

      new Plotly.newPlot(chartId, data, layout, settings);
    } catch (error) {
      console.error(error);
    }
  });  
</script>

<div id={chartId}></div>