<script>
	import { Timeout, quoteRefreshSeconds } from './../classes/Timer.js';
  import { _ } from "svelte-i18n";
  import debounce from "lodash/debounce";
  import BigNumber from "bignumber.js";
  import { onMount, onDestroy } from 'svelte';
  import orderBy from 'lodash/orderBy';
  import find from 'lodash/find';

  import ApiOx from "../classes/0xApi";
  import poolsConfig from '../config/pools.json';
  import TokenSelectModal from "../components/modals/TokenSelectModal.svelte";
  import Modal from '../components/elements/Modal.svelte';
  import ReviewQuoteModal from '../components/modals/ReviewQuoteModal.svelte';
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

  // will return undefined in first render if assigned to reactive variable
  const baseListed = [
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      icon: getTokenImage('eth'),
      decimals: 18
    },
    {
      address: '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
      symbol: 'DOUGH',
      icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D'),
      decimals: 18
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      icon: getTokenImage('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      decimals: 6
    }
  ];

  $: listed = baseListed;

  let modal;
  let modalOption = {
    title: "Review Quote",
    pieAddress: null,
    ovenAddress: null,
  };

  let targetModal = 'sell';
  let timeout;
  
  let defaultTokenSell = baseListed.find(l => l.symbol === 'ETH');
  let defaultTokenBuy = baseListed.find(l => l.symbol === 'DOUGH');

  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0
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

  const Timer = new Timeout(30000, () => {
    frozeQuote = null;
    fetchQuote(true) 
  });
  const api = new ApiOx();

  const toNum = (num, decimals = 18) => (BigNumber(num.toString()).dividedBy(10 ** decimals)).toFixed(6);

  $: sellToken = defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = defaultAmount;
  $: receivedAmount = 0;
  $: quote = null;
  $: frozeQuote = null;
  $: needAllowance = false;
  $: initialized = {
    onMount: false,
    onChainData: false
  };
  $: isLoading = false;
  $: allowances = {};
  $: balances = {};
  $: error = null;
  $: showSlippageSettings = false;
  $: balanceError = false;

  $: if($eth.address) {
    if(!initialized.onChainData && !isLoading) {
      isLoading = true;
      fetchOnchainData();
      initialized.onChainData = true;
      isLoading = false;
    }
  }

  onDestroy(() => {
    clearTimeout(timeout)
    Timer.stop();
  });

  onMount(async () => {
    isLoading = true;
    setupListedToken();

    if($eth.address) {
      await fetchOnchainData();
      initialized.onChainData = true;
    }
    await fetchQuote();
    initialized.onMount = true;
    isLoading = false;
  });

  function showBalanceError() {
    if(!balances[sellToken.address]) return;
    const weiAmount = amount.bn.toFixed(0);
    const shouldShowError = balances[sellToken.address].bn.isGreaterThanOrEqualTo(weiAmount) ? false : true;
    return shouldShowError;
  }

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if( allowance.isEqualTo(0) ) return true;
    if( allowance.isGreaterThanOrEqualTo( amount.bn ) ) return false;
  }

  function changeSlippage(value) {
    api.slippage  = value;
    fetchQuote();
  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    await approveMax(sellToken.address, ZeroEx);
    needAllowance = false;
    await fetchOnchainData();    
  }

  function onAmountChange() {
    const decimals = sellToken.decimals || 18;
    amount.bn = new BigNumber(amount.label).multipliedBy(10**decimals);
    fetchQuote()
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

    const gasPercentagePlus = BigNumber(quote.gas.toString()).multipliedBy(BigNumber(2.1)).toFixed(0);
    const transaction = {
        to: quote.to,
        value: ethers.BigNumber.from(quote.value),
        data: quote.data,
        gasLimit: ethers.BigNumber.from(gasPercentagePlus),
    };

    modal.close();

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
            message: `${amount.label.toFixed(2)} ${sellToken.symbol} swapped successfully`,
            type: "success",
          });
          fetchOnchainData();
          amount = defaultAmount;
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

    if(sellToken) {
      sellToken = find(listed, ['address', sellToken.address], defaultTokenSell);
    } else {
      sellToken = defaultTokenSell
    }

    if(buyToken) {
      buyToken = find(listed, ['address', buyToken.address], defaultTokenBuy);
    } else {
      buyToken = defaultTokenBuy
    }

    listed.forEach( token => {
      allowances[token.address] = token.allowance;
    })

    listed.forEach( token => {
      balances[token.address] = token.balance;
    })
  }

  async function fetchQuote(selfRefresh=false, freeze=false) {
    if(!amount.label || amount.label === 0 || amount.label === '' || isLoading === true) {
      Timer.stop();
      return;
    };

    balanceError = showBalanceError();

    if(!selfRefresh) {
      isLoading = true;
      quote = null;
      receivedAmount = 0;
      error = null;
    } else {
      console.log('refreshing quote')
    }
    const res = await api.getQuote(sellToken, buyToken, amount.bn);
    needAllowance = needApproval(sellToken.allowance);
    
    if(res.validationErrors) {
      switch(res.validationErrors[0].code) {
        case 1004:
          error = `Swap Unavailable.` 
          break;
      }
      isLoading = false;
      return;
    } else if(res.status === 500) {
      error = `Swap Unavailable.`
      isLoading = false;
      return;
    }
    quote = res;
    receivedAmount = toNum(quote.buyAmount, buyToken.decimals);
    isLoading = false;

    Timer.start();

    if(freeze) {
      frozeQuote = quote;
    }
  }

  function setupListedToken() {
    for (let i = 0; i < poolsConfig.available.length; i++) {
      let pie = poolsConfig[poolsConfig.available[i]];
      if(!pie.useMintOverBuy) {
        listed.push({
          address: poolsConfig.available[i],
          symbol: pie.symbol,
          icon: getTokenImage(poolsConfig.available[i])
        })
      }
    }
  }

</script>
  
<TokenSelectModal
  tokens={$eth.address ? orderBy(listed, ['balance.number'], ['desc']) : listed}
  open={tokenSelectModalOpen}
  callback={tokenSelectCallback} />

<Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <ReviewQuoteModal 
      fetchQuote={fetchQuote}
      quote={quote}
      buyToken={buyToken}
      close={modal.close}
      sellToken={sellToken}
      frozeQuote={frozeQuote}
      confirm={swap}
      isLoading={isLoading}
    />
  </span>
</Modal>

<div class="content flex flex-col pt-10pc justify-center spl">
  <div class="font-huge text-center">Exchange Tokens</div>
  <div class="font-thin text-lg text-center mt-10px mb-10px md:w-80pc">Swap Pies at the best rates.</div>

  <div class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc">

    <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
      <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
        {#if balances[sellToken.address]}
          <div on:click={() => {
            amount.label = balances[sellToken.address].number;
            amount.bn = balances[sellToken.address].bn;
            fetchQuote();
          }}>
            Max balance: {balances[sellToken.address].label}
          </div>
        {/if}
        
      </div>
    </div>
      <div class="flex nowrap items-center p-1">
        <input class:error={balanceError} class="swap-input-from" on:focus={() => {amount.label = amount.label === 0 ? '' : amount.label}} on:keyup={debounce(onAmountChange, 1000, {leading:false, trailing:true})} bind:value={amount.label} inputmode="decimal" title="Token Amount" autocomplete="off" autocorrect="off" type="number" pattern="^[0-9]*[.]?[0-9]*$" placeholder="0.0" minlength="1" maxlength="79" spellcheck="false">
        <button class="swap-button" on:click={() => {
          targetModal = 'sell';
          tokenSelectModalOpen = true;
        }}>
          <span class="sc-iybRtq gjVeBU">
            <img class="h-auto w-24px mr-5px" alt={sellToken ? `${sellToken.symbol} logo` : ''} src={sellToken ? sellToken.icon : ''}>
            <span class="sc-kXeGPI jeVIZw token-symbol-container">{sellToken ? sellToken.symbol : ''}</span>
            <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff"></path></svg>
          </span>
        </button>
      </div>
    </div>

    <div class="my-20px"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cccccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></div>
    
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
            <img class="h-auto w-24px mr-5px" alt={buyToken ? `${buyToken.symbol} logo` : ''} src={buyToken ? buyToken.icon : ''}>
            <span class="sc-kXeGPI jeVIZw token-symbol-container">{buyToken ? buyToken.symbol : ''}</span>
            <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff"></path></svg>
          </span>
        </button>
      </div>
    </div>
    
    {#if isLoading}
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Status:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">Finding the best price...</div>
      </div>
    {/if}

    {#if quote}
      <div class="flex items-center w-100pc pt-16px px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Price:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">1 {sellToken.symbol} @ {parseFloat(quote.price).toFixed(6)} {buyToken.symbol}</div>
      </div>
      <div class="flex items-center w-100pc px-16px justify-between">
        <div class="flex nowrap intems-center p-1 font-thin">Guaranteed Price:</div>
        <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">1 {sellToken.symbol} @ {parseFloat(quote.guaranteedPrice).toFixed(6)} {buyToken.symbol}</div>
      </div>
      
    {/if}
    <div class="flex items-center w-100pc px-16px justify-between mt-5px cursor-pointer"
      on:click={() => showSlippageSettings = !showSlippageSettings}
    >
      <div class="flex nowrap intems-center p-1 font-thin">Max Slippage:</div>
      <div class="flex font-thin">
        {#if showSlippageSettings }
          <button on:click={() => changeSlippage(1)} class:selected={api.slippage === 1} class="slippageBtn rounded-10px p-2px ">1%</button>
          <button on:click={() => changeSlippage(3)} class:selected={api.slippage === 3} class="slippageBtn rounded-10px p-2px ">3%</button>
          <button on:click={() => changeSlippage(5)} class:selected={api.slippage === 5} class="slippageBtn rounded-10px p-2px ">5%</button>
        {:else}
          <div 
          class="slippageBtn selected cursor-pointer"
          >{api.slippage}%</div>
        {/if}
      </div>
    </div>

    {#if error }
      <button disabled={true} class="stake-button error rounded-20px mt-10px p-15px w-100pc">
        {error}
      </button>
    {:else}
      {#if needAllowance }
        <button on:click={approveToken} class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Approve</button>
      {:else}
          <button class:error={error || isLoading || balanceError ? true : false} on:click={() => {
            frozeQuote = quote;
            modal.open();
          }} disabled={error || isLoading || balanceError ? true : false} class="stake-button mt-10px rounded-20px p-15px w-100pc">
            Review Order
          </button>
      {/if}
    {/if}

  </div>

</div>




