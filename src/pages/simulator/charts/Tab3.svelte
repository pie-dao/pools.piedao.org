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
        zeroline: false,
        side: 'right'
      },
      xaxis: {
        fixedrange: true,
        zeroline: false,
        ticktext: ['6 Months', '12 Months', '18 Months', '24 Months', '30 Months', '36 Months'], 
        tickvals: [6, 12, 18, 24, 30, 36],
        tickmode: 'array'        
      },
    };

    let settings = {
      displayModeBar: false,
      responsive: true,
    };

    var trace_median = {
      x: [0, 6, 12, 18, 24, 30, 36],
      y: [0, 5, 10, 15, 20, 25, 30],
      type: 'scatter',
      mode: 'lines',
      line: {
        width: 6
      }      
    };

    var trace_lowest = {
      x: [0, 6, 12, 18, 24, 30, 36],
      y: [0, 2, 4, 8, 12, 16, 20],
      type: 'scatter',
      mode: 'lines',
      line: {
        width: 6
      }        
    };    

    var trace_highest = {
      x: [0, 6, 12, 18, 24, 30, 36],
      y: [0, 10, 20, 30, 40, 50, 60],
      type: 'scatter',
      mode: 'lines',
      line: {
        width: 6
      }      
    };      

    var data = [trace_median, trace_lowest, trace_highest];

    new Plotly.newPlot(chartId, data, layout, settings);
  });

</script>

<div id={chartId}></div>