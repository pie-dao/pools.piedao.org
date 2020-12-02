<script>
import { watchResize } from 'svelte-watch-resize';
import uniqueId from 'lodash/uniqueId';
import { onMount } from 'svelte';  

export let value;
export let max;

let chart;
let chartId = uniqueId('chart_');

const resize = (node) => {
    if(chart && chart.resize)
        chart.resize(node.clientWidth, node.clientHeight);
}

const data = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: value,
    type: "indicator",
    mode: "gauge+number",
    title: { text: "Progress" },
    delta: { reference: 10 },
    gauge: {
      axis: { range: [null, max], tickcolor: "darkblue" },
      bar: { color: "#EC1EA0" },
    }
  }
];

var layout = { 
  width: 400, 
  height: 250, 
  paper_bgcolor: "#f3f3f3",
  margin: { t: 0, b: 0 }, showlegend: false };

onMount(async () => {

    console.log('value', value)
    let plotDiv = document.getElementById(chartId);
    let Plot = await new Plotly.newPlot(plotDiv, data, layout, {responsive: true}); 
    console.log('Plot', Plot)
});
</script>

<div id={chartId} use:watchResize={resize}></div>