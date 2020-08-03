<script>
  import { _ } from "svelte-i18n";
  import { currentRoute } from "../stores/routes.js";
  import TradingViewWidget from "../components/TradingViewWidget.svelte";
  import images from "../config/images.json";
  import pools from "../config/pools.json";

  let token = $currentRoute.params.address;

  $: symbol = (pools[token] || {}).symbol;
  $: tokenLogo = images.logos[symbol];

  let options = {
    symbol:
      "1.0069862312601948*COINBASE:COMPUSD+70.6180873079698*COINBASE:KNCUSD+493.8217925005066*BINANCE:LENDUSD+33.61720214153774*COINBASE:LINKUSD+0.3545441741414431*COINBASE:MKRUSD+41.28487136484088*BINANCE:SNXUSD",
    theme: "light",
    autosize: true,
    interval: "60",
    locale: "en",
    style: 3,
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false
  };
</script>

<div class="content flex flex-col spl">
  <div class="flex flex-wrap w-full">
    <div class="flex flex-row content-between flex-wrap w-full">
      <div class="flex flex-row sm:w-full md:w-1/2">
        <img class="h-100px inline" src={tokenLogo} alt={symbol} />
        <div class="m-3">
          <h1 class="text-xl leading-none font-black">{symbol}</h1>
          <h5 class="text-xl leading-none font-thin">$ 9,2345.34</h5>
        </div>
      </div>

      <div class="sm:w-full md:w-1/2">
        <button class="btn text-white font-bold py-2 px-4 rounded">Mint</button>
        <button class="btn clear text-white font-bold py-2 px-4 rounded">Redeem</button>
        <button class="btn clear font-bold py-2 px-4 rounded">Buy</button>
      </div>

    </div>
  </div>
  <div class="flex content-between flex-wrap w-full mt-8">
    <div class="w-1/4 p-0 self-start">
      <div class="text-center font-thin">MarketCap</div>
      <div class="text-center text-xl font-black">500K</div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">Swap fee</div>
      <div class="text-center text-xl font-black">10%</div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">Exit fee</div>
      <div class="text-center text-xl font-black">0%</div>
    </div>
    <div class="w-1/4 p-0">
      <div class="text-center font-thin">Swap enabled</div>
      <div class="text-center text-xl font-black">false</div>
    </div>
  </div>

  <div class="flex flex-row w-100pc mt-8 spl-chart-container">
    <TradingViewWidget {options} />
  </div>

  <div class="w-full mt-8">
    <table class="table-auto">
      <thead>
        <tr>
          <th class="px-4 py-2">Title</th>
          <th class="px-4 py-2">Author</th>
          <th class="px-4 py-2">Views</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border px-4 py-2">Intro to CSS</td>
          <td class="border px-4 py-2">Adam</td>
          <td class="border px-4 py-2">858</td>
        </tr>
        <tr class="bg-gray-100">
          <td class="border px-4 py-2">
            A Long and Winding Tour of the History of UI Frameworks and Tools and the Impact on
            Design
          </td>
          <td class="border px-4 py-2">Adam</td>
          <td class="border px-4 py-2">112</td>
        </tr>
        <tr>
          <td class="border px-4 py-2">Intro to JavaScript</td>
          <td class="border px-4 py-2">Chris</td>
          <td class="border px-4 py-2">1,280</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
