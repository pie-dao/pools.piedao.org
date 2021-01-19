<script>
  import debounce from "lodash/debounce";
  import BigNumber from "bignumber.js";
  import { onMount } from 'svelte';
  import ApiOx from "../classes/0xApi";
  import poolsConfig from '../config/pools.json';
  import TokenSelectModal from "../components/modals/TokenSelectModal.svelte";
  import {
    allowances,
    functionKey,
    approveMax,
    balanceKey,
    balances,
    connectWeb3,
    eth,
  } from "../stores/eth.js";

  import {
    getTokenImage,
    fetchEthBalance,
  } from "../components/helpers";

  $: listed = [
    {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      icon: getTokenImage('eth')
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      icon: getTokenImage('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    }
  ];

  let targetModal = 'sell';

  let defaultTokenSell = {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    icon: getTokenImage('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
  }

  let defaultTokenBuy = {
    address: '0xe4f726adc8e89c6a6017f01eada77865db22da14',
    symbol: 'BCP',
    icon: getTokenImage('0xe4f726adc8e89c6a6017f01eada77865db22da14')
  };

  let tokenSelectModalOpen = false;
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (token) {
      console.log('new token', token);
      if(targetModal === 'sell') {
        sellToken = token;
      } else if(targetModal === 'buy') {
        buyToken = token;
      }
      fetchQuote();
    }
  };

  const api = new ApiOx();

  const toNum = (num) => (BigNumber(num.toString()).dividedBy(10 ** 18)).toNumber();

  $: sellToken = defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = 0;
  $: receivedAmount = 0;
  $: quote = null;
  $: needAllowance = true;

  $: if($eth.address) {
    // Fetch balances
    // Fetch Allowances
    //needAllowance = needApproval(pool, ($allowances[pool.allowanceKey] || BigNumber(0)));
  }

  onMount(async () => {
    setupListedToken();
    console.log('listed', listed)
    fetchQuote();
  });

  async function fetchQuote() {
    if(amount === 0) return;
    quote = await api.getQuote(sellToken.address, buyToken.address, amount);
    console.log('quote', quote);
    if(quote === false) {
      console.log('Show Error');
    }
    receivedAmount = amount*parseFloat(quote.price);
  }

  function setupListedToken() {
    for (let i = 0; i < poolsConfig.available.length; i++) {
      let pie = poolsConfig[poolsConfig.available[i]];
      listed.push({
        address: poolsConfig.available[i],
        symbol: pie.symbol,
        icon: getTokenImage(poolsConfig.available[i])
      })
    }
  }





</script>
  
<TokenSelectModal
  tokens={listed}
  open={tokenSelectModalOpen}
  callback={tokenSelectCallback} />

<div class="content flex flex-col pt-10pc justify-center spl">

  <div class="font-huge text-center">Swap Tokens</div>
  <div class="font-thin text-lg text-center mt-10px mb-10px md:w-80pc">Pies at the best rates.</div>


  <div class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc">

    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">Balance: 1.55489</div>
    </div>
      <div class="flex nowrap items-center p-1">
        <input class="swap-input-from" on:focus={() => {amount = amount=== 0 ? '' : amount}} on:keyup="{ debounce(fetchQuote, 250)}" bind:value={amount} inputmode="decimal" title="Token Amount" autocomplete="off" autocorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
        <button class="swap-button" on:click={() => {
          targetModal = 'sell';
          tokenSelectModalOpen = true;
        }}>
          <span class="sc-iybRtq gjVeBU">
            <img class="h-auto w-24px mr-5px" alt={`${sellToken.symbol} logo`} src={sellToken.icon}>
            <span class="sc-kXeGPI jeVIZw token-symbol-container">{sellToken.symbol}</span>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path></svg>
          </span>
        </button>
      </div>
    </div>

    <div class="my-20px"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C3C5CB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></div>
    
    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">To (estimated)</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">Balance: 1.55489</div>
    </div>
      <div class="flex nowrap items-center p-1">
        <input class="swap-input-from" bind:value={receivedAmount} disabled inputmode="decimal" title="Token Amount" autocomplete="off" autocorrect="off" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
        <button class="swap-button" on:click={() => {
          targetModal = 'buy';
          tokenSelectModalOpen = true;
        }}>
          <span class="sc-iybRtq gjVeBU">
            <img class="h-auto w-24px mr-5px" alt={`${buyToken.symbol} logo`} src={buyToken.icon}>
            <span class="sc-kXeGPI jeVIZw token-symbol-container">{buyToken.symbol}</span>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path></svg>
          </span>
        </button>
      </div>
    </div>

    {#if quote}
      <div class="flex items-center w-100pc pt-16px px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Price {sellToken.symbol}/{buyToken.symbol}</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">{quote.price}</div>
      </div>
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Price: {buyToken.symbol}/{sellToken.symbol}</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">{(amount/(amount*parseFloat(quote.price)))}</div>
      </div>
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Guaranteed Price:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">{quote.guaranteedPrice}</div>
      </div>
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Max Slippage:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">1%</div>
      </div>
    {/if}
    

    <a class="w-100pc pt-10px" href="https://balancer.exchange/#/swap/ether/0xad32A8e6220741182940c5aBF610bDE99E737b2D" target="_blank">
      <button class="stake-button rounded-20px p-15px w-100pc">
        Swap
      </button>
    </a>


  </div>

</div>




