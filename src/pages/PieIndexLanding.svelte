<script>
  import { _ } from 'svelte-i18n';
  import BigNumber from 'bignumber.js';
  import get from 'lodash/get';
  import first from 'lodash/first';
  import flattenDeep from 'lodash/flattenDeep';
  import orderBy from 'lodash/orderBy';
  import { onMount } from "svelte";
  import { currentRoute } from "../stores/routes.js";
  import TradingViewWidget from "../components/TradingViewWidget.svelte";
  import Etherscan from "../components/Etherscan.svelte";
  import Farming from "../components/Farming.svelte";
  import Quantstamp from "../components/Quantstamp.svelte";
  import PoolDescription from "../components/PoolDescription.svelte";

  import images from '../config/images.json';
  import poolsConfig from '../config/pools.json';
  import { CoinGecko, piesMarketDataStore } from '../stores/coingecko.js';

  import { fetchPooledTokens, pooledTokenAmountRequired } from '../components/helpers.js';

  import { amountFormatter, getTokenImage, formatFiat, fetchPieTokens } from '../components/helpers.js';

  import { pools } from '../stores/eth.js';

  import {
    balanceKey,
    contract,
    balances,
  } from "../stores/eth.js";

  export let params;

  $: token = params.address;

  let pieOfPies = false;
  let tradingViewWidgetComponent;
  let initialized = false;

  $: console.log(token, poolsConfig);
  
  $: options = {
    symbol: poolsConfig[token] ? poolsConfig[token].tradingViewFormula : '',
    container_id: `single-pie-chart-${token}`,
    theme: 'light',
    autosize: true,
    interval: '60',
    locale: 'en',
    style: 3,
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false,
  };

  $: links = (poolsConfig[token] || {}).landingLinks || [];

  $: symbol = (poolsConfig[token] || {}).symbol;
  $: swapFees = (poolsConfig[token] || {}).swapFees;
  $: tokenLogo = images.logos[token];
  $: change24H = get(
    $piesMarketDataStore,
    `${token}.market_data.price_change_percentage_24h`,
    null,
  );
  $: tokenPrice = get(
    $piesMarketDataStore,
    `${token.toLowerCase()}.market_data.current_price`,
    null,
  );

  $: (() => {
    pieOfPies = false;
  })(token);

  $: composition = flattenDeep(
    $pools[token].map((component) => {
      if (component.isPie) {
        if(!pieOfPies) pieOfPies = [];
        pieOfPies.push(component);
        return $pools[component.address].map((internal) => {
          return {
            ...internal,
            // percentage: ((component.percentage / 100) * (internal.percentage / 100) * 100),
            percentage: (internal.percentage * component.percentage) / 100,
          };
        });
      }
      return component;
    })
  );


  $: pieTokens = fetchPieTokens($balances);

  $: (async () => {
    if(initialized) return;

    let mapDynamicTradingViewFormula = poolsConfig[token].mapDynamicTradingViewFormula;
    let formula = '';

    if(!mapDynamicTradingViewFormula) return;

    const poolContract = await contract({ address: token });
    const bPoolAddress = await poolContract.getBPool();
    let totalSupply = await poolContract.totalSupply();
    totalSupply = BigNumber(totalSupply.toString()).dividedBy(10 ** 18);

    $pools[token].map((component) => {
      let key = `${component.address.toLowerCase()}.${bPoolAddress.toLowerCase()}`;
      const bal = $balances[key] || 0;

      if(bal !== 0) {
        formula += `${bal / totalSupply.toNumber()}*${mapDynamicTradingViewFormula[component.address]}+`;
      }
    })

    if(formula !== '') {
      const finalFormula = `${formula.slice(0, -1)}`;
      console.log(`formula`, finalFormula);
      options.symbol = finalFormula;
      if(tradingViewWidgetComponent) {
        initialized = true;
        tradingViewWidgetComponent.initWidget(options)
      }
    }
  })();

</script>
<div class="content flex flex-col spl">
  <div class="flex flex-wrap w-full">
    <div class="flex flex-row content-between justify-between flex-wrap w-full">
      <div class="flex flex-row sm:w-full md:w-1/3">
        <a href={`#/pools/${token}`}>
          <img class="h-80px inline" src={tokenLogo} alt={symbol} />
        </a>
        <div class="mx-3 flex flex-col justify-center">
          <a href={`#/pools/${token}`}>
            <h1 class="text-xl leading-none font-black">{symbol}</h1>
          </a>
          {#if change24H}
            <h5
              class:green={change24H > 0}
              class:red={change24H < 0}
              class="text-sm leading-none font-thin">
              {change24H}%
            </h5>
          {/if}
          {#if tokenPrice}
            <h5 class="text-xl leading-none font-thin">{formatFiat(tokenPrice)}</h5>
          {/if}
        </div>
      </div>

      <div class="sm:w-full md:w-2/3 flex flex-row-reverse">
        <a href={`#/pools/${token}/withdraw/multi`}>
          <button class="btn text-white font-bold ml-0 mr-1 rounded md:ml-4 py-2 px-4">Redeem</button>
        </a>
        <a href={`#/pools/${token}`}>
          <button class="btn text-white font-bold ml-0 mr-1 rounded md:ml-4 py-2 px-4">Mint</button>
        </a>
        <!-- <a href={`https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0`}>
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Buy</button>
        </a> -->
      </div>
    </div>
  </div>
  <div class="flex justify-between flex-wrap w-full mt-2 md:mt-8">
    {#if get($piesMarketDataStore, `${token.toLowerCase()}.market_data.market_cap`, '-') != '-'}
    <div class="p-0 self-start md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">MarketCap</div>
      <div class="text-center text-2xl md:text-xl font-black">
        {formatFiat(get($piesMarketDataStore, `${token}.market_data.market_cap`, '-'))}
      </div>
    </div>
    {/if}
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">Swap fee</div>
      <div class="text-center text-2xl md:text-xl font-black">{swapFees}%</div>
    </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">Streaming fee</div>
      <div class="text-center text-2xl md:text-xl font-black">0%</div>
    </div>
    <div class="p-0 md:w-1/4">
      <div class="text-center font-thin text-xs md:text-base">7 Days Change</div>
      <div class="text-center text-2xl md:text-xl font-black">
        {get($piesMarketDataStore, `${token}.market_data.price_change_percentage_7d_in_currency`, '-')}
      </div>
    </div>
  </div>

  <div
    class="flex flex-row w-100pc mt-2 spl-chart-container md:mt-8 {poolsConfig[token].mapDynamicTradingViewFormula ? '' : 'hidden'}">
    <TradingViewWidget bind:this={tradingViewWidgetComponent} {options} />
  </div>

  <div class="flex flex-col w-full mt-2 md:mt-8 md:justify-between md:flex-row">
    <div class="p-0 mt-2 md:half">
      <Farming token={$currentRoute.params.address} />
    </div>  
    <div class="p-0 mt-2 md:w-1/4">
      <Etherscan token={$currentRoute.params.address} />
    </div>

    <div class="p-0 mt-2 md:w-1/4">
      <Quantstamp class="w-1/2" token={$currentRoute.params.address} />
    </div>
  </div>

  <h1 class="mt-8 mb-4 text-base md:text-3xl">Allocation breakdown</h1>
  {#if pieOfPies }
    <h4>*This allocation is composed of multiple pies, find below the exploded allocation.</h4>
    <ul>
      {#each pieOfPies as subPie}
        <li><a href="#/pie/{subPie.address}">{subPie.symbol}</a></li>
      {/each}
    </ul>
  {/if}

  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Asset name</th>
          <th class="font-thin border-b-2 px-4 py-2">Price</th>
          <th class="font-thin border-b-2 px-4 py-2">Current Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2">Market Cap</th>
          <th class="font-thin border-b-2 px-4 py-2">Volume</th>
          <th class="font-thin border-b-2 px-4 py-2">Change</th>
        </tr>
      </thead>
      <tbody>
        {#each orderBy(composition,['percentage'], ['desc']) as pooledToken}
          <tr>
            <td class="border border-gray-800 px-2 py-2 text-left">
              <img
                class="inline icon ml-2 mr-2"
                src={getTokenImage(pooledToken.address)}
                alt={pooledToken.symbol} />
              {pooledToken.symbol}
            </td>
            <td class="border text-center px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.current_price`, '-'))}
            </td>
            {#if pieOfPies }
              <td class="border text-center px-4 py-2">{amountFormatter({ amount: pooledToken.percentage, displayDecimals: 2 })}%</td>
            {:else}
              <td class="border text-center px-4 py-2">{amountFormatter({ amount: pooledToken.percentageUSD, displayDecimals: 2 })}%</td>
            {/if}
            
            <td class="border text-center px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.market_cap`, '-'))}
            </td>
            <td class="border text-center px-4 py-2">
              {formatFiat(get($piesMarketDataStore, `${pooledToken.address}.market_data.total_volume`, '-'))}
            </td>
            <td class="border text-center py-2">
              <img
                class="w-30 spark mx-0"
                alt="Sparkline"
                src="https://www.coingecko.com/coins/{pooledToken.coingeckoImageId}/sparkline" 
                style="margin: auto;" />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <!-- <PoolDescription /> -->
  <div class="tags-container w-full my-2 flex flex-col md:flex-row md:justify-between md:my-8">
    {#each links as link}
      <a class="singleTag my-2" target="_blank" href={link.url}>{link.label}</a>
    {/each}
  </div>

  <h1 class="mt-8 mb-4 text-base md:text-3xl">Latest news</h1>

  <div class="flex flex-col w-full justify-between md:flex-row">
    <div class="w-full md:w-49pc">
      <blockquote class="twitter-tweet"><p lang="en" dir="ltr">Membership Proposal ✅ passed<br><br>The proposal will enable members <a href="https://twitter.com/TheLAOOfficial?ref_src=twsrc%5Etfw">@TheLAOOfficial</a> to join <a href="https://twitter.com/PieDAO_DeFi?ref_src=twsrc%5Etfw">@PieDAO_DeFi</a>, a fee-collecting organization coordinating weights of “tokenized asset allocations”, PIEs that is open to anyone <a href="https://twitter.com/ethereum?ref_src=twsrc%5Etfw">@ethereum</a> through the purchase of its voting shares, <a href="https://twitter.com/search?q=%24DOUGH&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$DOUGH</a> 💜 <a href="https://t.co/ikCkLTeGJy">https://t.co/ikCkLTeGJy</a> <a href="https://t.co/4L13l1xsXl">pic.twitter.com/4L13l1xsXl</a></p>&mdash; ⟠ DeFi++ (@defiopfi) <a href="https://twitter.com/defiopfi/status/1299419505018515457?ref_src=twsrc%5Etfw">August 28, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    </div>
    <div class="w-full md:w-49pc">
      <blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">1/2 Proposing a few changes to DEFI++<br><br>Model<br>1) Using an 30d AVG for market cap to calculate weights (better in volatile markets)<br><br>Allocation<br>1) Adding <a href="https://twitter.com/search?q=%24MLN&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$MLN</a> from <a href="https://twitter.com/melonprotocol?ref_src=twsrc%5Etfw">@melonprotocol</a> and <a href="https://twitter.com/search?q=%24PNT&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$PNT</a> from <a href="https://twitter.com/pTokens_io?ref_src=twsrc%5Etfw">@pTokens_io</a> on DEFI+S <br>2) Adding <a href="https://twitter.com/search?q=%24YFI&amp;src=ctag&amp;ref_src=twsrc%5Etfw">$YFI</a> to DEFI+L<br><br>By <a href="https://twitter.com/Alexintosh?ref_src=twsrc%5Etfw">@Alexintosh</a> via <a href="https://twitter.com/PieDAO_DeFi?ref_src=twsrc%5Etfw">@PieDAO_DeFi</a> Discord</p>&mdash; ⟠ DeFi++ (@defiopfi) <a href="https://twitter.com/defiopfi/status/1297027983459471360?ref_src=twsrc%5Etfw">August 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>    </div>
  </div>
</div>
