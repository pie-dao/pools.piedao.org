<script>
  import { onMount } from 'svelte'; 
  import uniqueId from 'lodash/uniqueId';

  // creating a unique chart id...
  let chartId = uniqueId('chart_');
  
  // Plotly - Charts Section
  onMount(async () => {
    let layout = {
      showlegend: false,
      yaxis: {
        fixedrange: true,
      },
      xaxis: {
        fixedrange: true,
      },
    };

    let settings = {
      displayModeBar: false,
      responsive: true,
    };

    var trace = {
      x: [6, 12, 18, 24, 30, 36],
      y: [10, 15, 13, 17, 22, 54],
      type: 'scatter',
    };

    var data = [trace];

    new Plotly.newPlot(chartId, data, layout, settings);
  });

</script>

<div id={chartId}></div>