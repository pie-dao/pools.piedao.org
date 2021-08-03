<script>
  import { onMount } from 'svelte'; 
  import uniqueId from 'lodash/uniqueId';

  export let projections = {};

  // creating a unique chart id...
  let chartId = uniqueId('chart_');

  let x = [];
  let y_distributed = [];
  let y_compound = [];
  let y_costs = [];

  for(let i = 0; i < projections.median.farming.gains.length; i++) {
    x[i] = i;

    if(i == 0) {
      y_distributed[i] = 0;
      y_compound[i] = 0;
      y_costs[i] = 0;
    } else {
      y_distributed[i] = y_distributed[i - 1] + (projections.median.farming.gains[i] * 0.60);
      y_compound[i] = y_compound[i - 1] + (projections.median.farming.gains[i] * 0.25);
      y_costs[i] = y_costs[i - 1] + (projections.median.farming.gains[i] * 0.15); 
    }
  }
  
  // Plotly - Charts Section
  onMount(async () => {
    let layout = {
      margin: {
        pad: 20,
        l: 10,
        r: 70,
        t: 10,
        b: 80        
      },
      legend: {
        y: 1.5,
        x: 0.5,
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
      responsive: true
    };

    var trace_median = {
      x: x,
      y: y_distributed,
      type: 'scatter',
      mode: 'lines',
      name: 'Distributed to Holders',
      line: {
        width: 6,
        color: '#65D0F5'
      }      
    };

    var trace_lowest = {
      x: x,
      y: y_compound,
      type: 'scatter',
      mode: 'lines',
      name: 'Compound Treasury',
      line: {
        width: 6,
        color: "#F8E71C"
      }        
    };    

    var trace_highest = {
      x: x,
      y: y_costs,
      type: 'scatter',
      mode: 'lines',
      name: 'Cover Costs',
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