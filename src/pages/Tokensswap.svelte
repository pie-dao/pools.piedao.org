<script>
  import { _ } from "svelte-i18n";
  import debounce from "lodash/debounce";
  import BigNumber from "bignumber.js";
  import { onMount } from 'svelte';
  import orderBy from 'lodash/orderBy';
  import find from 'lodash/find';

  import ApiOx from "../classes/0xApi";
  import poolsConfig from '../config/pools.json';
  import TokenSelectModal from "../components/modals/TokenSelectModal.svelte";
  import displayNotification from "../notifications";
  import { ethers } from 'ethers';
  
  import {
    subject,
    approveMax,
    connectWeb3,
    eth,
  } from "../stores/eth.js";

  import {
    fetchBalances,
  } from '../helpers/multicall';

  import {
    getTokenImage
  } from "../components/helpers";

  const ZeroEx = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
  $: listed = [
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      icon: getTokenImage('eth')
    },
    {
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      symbol: 'DAI',
      icon: getTokenImage('0x6B175474E89094C44Da98b954EedeAC495271d0F')
    }
  ];

  let targetModal = 'sell';

  let defaultTokenSell = {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
    icon: getTokenImage('ETH')
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
      if(targetModal === 'sell') {
        if(token === buyToken) {
          return;
        }
        sellToken = token;
      } else if(targetModal === 'buy') {
        if(token === sellToken) {
          return;
        }
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
  $: needAllowance = false;
  $: initialized = false;
  $: allowances = {};
  $: balances = {};
  $: error = null;

  $: if($eth.address) {
    if(!initialized) {
      fetchOnchainData();
    }
    
  }

  onMount(async () => {
    setupListedToken();    
    sellToken = find(listed, ['address', defaultTokenSell.address]);
    buyToken = find(listed, ['address', defaultTokenBuy.address]);
    fetchQuote();
  });

  function needApproval(allowance) {
    if( allowance.isEqualTo(0) ) return true;
    if( allowance.isGreaterThanOrEqualTo( BigNumber(amount)) ) return false;
  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const { emitter } = displayNotification(await approveMax(sellToken.address, ZeroEx));
    
    await new Promise((resolve) => emitter.on('txConfirmed', ({ blockNumber }) => {
      resolve();
      return { message: `${sellToken.symbol} unlocked`, type: 'success' };
    }));

    needAllowance = false;
  }

  async function swap() {
    if(!quote) {
      error = "You need a quote first."
      return;
    }

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const gasPercentagePlus = BigNumber(quote.gas.toString()).multipliedBy(BigNumber(1.1)).toFixed(0);
    const transaction = {
        to: quote.to,
        value: ethers.BigNumber.from(quote.value),
        data: quote.data,
        gasLimit: ethers.BigNumber.from(gasPercentagePlus),
    };

    const { emitter } = displayNotification(await $eth.signer.sendTransaction(transaction) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${amount.toFixed()} ${sellToken.symbol} swapped successfully`,
            type: "success",
          });
          fetchOnchainData();
          amount = 0;
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success",
      };
    });
  }

  async function fetchOnchainData() {
    // Fetch balances, allowance and decimals
    listed = await fetchBalances(
      listed,
      $eth.address,
      $eth.provider
    )

    initialized = true;
    sellToken = find(listed, ['address', defaultTokenSell.address]);
    buyToken = find(listed, ['address', defaultTokenBuy.address]);

    listed.forEach( token => {
      allowances[token.address] = token.allowance;
    })

    listed.forEach( token => {
      balances[token.address] = token.balance;
    })
  }

  async function fetchQuote(selfRefresh=false) {
    if(amount === 0) return;

    if(!selfRefresh) {
      quote = null;
      receivedAmount = 0;
      error = null;
    }
    const res = await api.getQuote(sellToken, buyToken, amount);
    needAllowance = needApproval(sellToken.allowance);
    
    if(res.validationErrors) {
      switch(res.validationErrors[0].code) {
        case 1004:
          error = `Could not find a path to exchange.` 
          break;
      }

      return;
    }
    quote = res;
    receivedAmount = toNum(quote.buyAmount);
    setTimeout(() => fetchQuote(true), 10000);
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
  tokens={orderBy(listed, ['balance.number'], ['desc'])}
  open={tokenSelectModalOpen}
  callback={tokenSelectCallback} />

<div class="content flex flex-col pt-10pc justify-center spl">

  <div class="font-huge text-center">Swap Tokens</div>
  <div class="font-thin text-lg text-center mt-10px mb-10px md:w-80pc">Pies at the best rates.</div>


  <div class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc">

    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
        {#if balances[sellToken.address]}
          <div on:click={() => {
            amount = balances[sellToken.address].label;
            fetchQuote();
          }}>
            Max balance: {balances[sellToken.address].label}
          </div>
        {/if}
        
      </div>
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
            <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff"></path></svg>
          </span>
        </button>
      </div>
    </div>

    <div class="my-20px"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C3C5CB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></div>
    
    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">To (estimated)</div>
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
            <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff"></path></svg>
          </span>
        </button>
      </div>
    </div>
    
    {#if error}
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Error:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">{error}</div>
      </div>
    {/if}

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

    {needAllowance}
    {#if needAllowance }
      <button on:click={approveToken} class="btn clear stake-button rounded-20px p-15px w-100pc">Approve</button>
    {:else}
      <button on:click={swap} disabled={error ? true : false} class="stake-button rounded-20px p-15px w-100pc">
        Swap
      </button>
    {/if}

  </div>

</div>




