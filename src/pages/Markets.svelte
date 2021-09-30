<script>
import { watchResize } from 'svelte-watch-resize';
// import {getSubgraphMetadata, getPoolSwaps, getPoolMetrics} from '../helpers/subgraph.js'
import { fetchChartData } from '../stores/coingecko.js'
import PriceChartArea from '../components/charts/piePriceAreaChart.svelte'

let chart;

const resize = (node) => {
    if(chart && chart.resize)
        chart.resize(node.clientWidth, node.clientHeight);
}

( async () => {
const poolId = '0x0e5c1813587088378787e7dd6c9cb4cb01a0ea18';


// const metadata = await getSubgraphMetadata(poolId);
// const swaps = await getPoolSwaps(poolId);
// const metrics = await getPoolMetrics(poolId);

const chartData = await fetchChartData('piedao-defi-large-cap');

chart = LightweightCharts.createChart(document.getElementById('chart'), {
	width: 600,
    height: 300,
    grid: {
		horzLines: {
			color: '#ffffff',
		},
		vertLines: {
			color: '#ffffff',
		},
	},
	rightPriceScale: {
		borderVisible: false,
	},
	timeScale: {
		borderVisible: false,
	},
});

var areaSeries = chart.addAreaSeries({
    bottomColor: 'rgba(116, 58, 213, 0.5)',
    topColor: '#d53a9d',
    // topColor: '#743ad5',
    // bottomColor: '#d53a9d',
    lineColor: '#34D8FF',
    lineWidth: 2,
});

const normalizedData = chartData.prices.map( p => {
    return {
        time: p[0]/1000,
        value: p[1]
    }
});

areaSeries.setData(normalizedData);
})
</script>

<div id="chart" use:watchResize={resize}></div>
<PriceChartArea coingeckoId="piedao-defi-large-cap"/>