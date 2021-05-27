<script>
  import { onMount } from 'svelte'; 
  import uniqueId from 'lodash/uniqueId';

  export let projections = {};

  // creating a unique chart id...
  let chartId = uniqueId('chart_');

  let x = [];
  let y_median = [0];
  let y_lowest = [];
  let y_highest = [];

  for(let i = 0; i < projections.median.farming.asset.length; i++) {
    x[i] = i + 1;

    if(i == 0) {
      y_median[i] = projections.median.farming.asset[i];
      y_lowest[i] = projections.lowest.farming.asset[i];
      y_highest[i] = projections.highest.farming.asset[i];
    } else {
      y_median[i] = y_median[i - 1] + projections.median.farming.asset[i];
      y_lowest[i] = y_lowest[i - 1] + projections.lowest.farming.asset[i];
      y_highest[i] = y_highest[i - 1] + projections.highest.farming.asset[i];
    }
  
  }
  
  // Plotly - Charts Section
  onMount(async () => {
    let layout = {
      margin: {
        pad: 20
      },
      legend: {
        y: 1.5,
        x: 0.6,
        orientation: "h",
        tracegroupgap: 500
      },
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
      x: x,
      y: y_median,
      type: 'scatter',
      mode: 'lines',
      name: 'Median APR',
      line: {
        width: 6,
        color: '#65D0F5'
      }      
    };

    var trace_lowest = {
      x: x,
      y: y_lowest,
      type: 'scatter',
      mode: 'lines',
      name: 'Lowest APR',
      line: {
        width: 6,
        color: "#F8E71C"
      }        
    };    

    var trace_highest = {
      x: x,
      y: y_highest,
      type: 'scatter',
      mode: 'lines',
      name: 'Highest APR',
      line: {
        width: 6,
        color: '#F005C4'
      }      
    };      

    var data = [trace_median, trace_lowest, trace_highest];

    new Plotly.newPlot(chartId, data, layout, settings);
  });

</script>

<div id={chartId}></div>