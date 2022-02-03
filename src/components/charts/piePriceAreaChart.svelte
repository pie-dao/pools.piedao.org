<script>
  import { watchResize } from 'svelte-watch-resize';
  import uniqueId from 'lodash/uniqueId';
  import { fetchChartData } from '../../stores/coingecko.js';
  import { clickOutside } from '../../helpers/clickOutside.js';

  export let coingeckoId;
  let chart;
  let chartId = uniqueId('chart_');
  let dropdownOpen = false;

  const toggleDropdown = (event) => {
    dropdownOpen = !dropdownOpen;
  };

  const closeDropdown = (event) => {
    dropdownOpen = false;
  };

  const resize = (node) => {
    if (chart && chart.resize) chart.resize(node.clientWidth, node.clientHeight);
  };

  function yearToDate(){
    const currentDate = new Date();
    return (Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(currentDate.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
  };

  async function loadChart(days = 90) {
    const chartData = await fetchChartData(coingeckoId, days);

    if (chart) chart.remove();
    chart = LightweightCharts.createChart(document.getElementById(chartId), {
      width: 1250,
      height: 450,
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

    chart.applyOptions({
      handleScroll: true,
      handleScale: false,
      timeScale: {
        timeVisible: true,
      }
    });

    var areaSeries = chart.addAreaSeries({
      bottomColor: '#FAFDFF',
      topColor: '#85DBED',
      lineColor: '#26D3F9',
      lineWidth: 2,
    });

    const normalizedData = chartData.prices.map((p) => {
      return {
        time: p[0] / 1000,
        value: p[1],
      };
    });

   areaSeries.setData(normalizedData);
   chart.timeScale().fitContent();
  }
  
  loadChart();
  
</script>

<br/>
<div class="interval-button">
  <div use:clickOutside on:click_outside={closeDropdown}>
    <button
        on:click={toggleDropdown}
        type="button"
        class="inline-flex text-sm leading-5 font-medium focus:outline-none"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
        >Date Range
        <svg
          class="-mr-1 ml-3px h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="black"
          ><path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          /></svg
        >
      </button>
    {#if dropdownOpen}
      <div
        class="z-50 mt-1 thinborder origin-top-right absolute left-0 w-24 roundedl drowpdown-shadow"
      >
        <div
          class="bg-white roundedl"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div class="py-1 roundedl">
            <button
              on:click={() => loadChart(1)}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">1D</button
            >
            <button
              on:click={() => loadChart(7)}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">1W</button
            >
            <button
            on:click={() => loadChart(30)}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">1M</button
            >
            <button
            on:click={() => loadChart(90)}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">3M</button
            >
            <button
            on:click={() => loadChart(365)}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">1Y</button
            >
            <button
            on:click={() => loadChart(yearToDate())}
              on:click={closeDropdown}
              class="interval-dropdown block px-4 py-2 text-sm font-thin leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              role="menuitem">YTD</button
            >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
<div id={chartId} use:watchResize={resize} />

<style>
  .interval-dropdown {
    text-align: center;
  }
  .interval-button {
    margin-left: 0;
    margin-right: auto;
    position: relative;
  }
</style>
