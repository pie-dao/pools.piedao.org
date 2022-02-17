<script>
  import { Timeout, quoteRefreshSeconds } from './../classes/Timer.js';
  import { _ } from 'svelte-i18n';
  import debounce from 'lodash/debounce';
  import BigNumber from 'bignumber.js';
  import { onMount, onDestroy } from 'svelte';
  import orderBy from 'lodash/orderBy';
  import find from 'lodash/find';

  import poolsConfig from '../config/pools.json';
  import smartPoolAbi from '../abis/smartPoolV2.json';
  import TokenSelectModal from '../components/modals/TokenSelectModal.svelte';
  import Modal from '../components/elements/Modal.svelte';
  import ReviewQuoteModal from '../components/modals/ReviewQuoteModal.svelte';
  import displayNotification from '../notifications';
  import { ethers } from 'ethers';

  import { subject, approveMax, connectWeb3, eth } from '../stores/eth.js';

  import { fetchBalances } from '../helpers/multicall';

  import { getTokenImage } from '../components/helpers';

  export let listed = [];

  export let buyTokenAddress;
  export let buyTokenSymbol;

  const ZeroEx = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
  //   $: listed = [
  //     {
  //       address: token1Address,
  //       symbol: 'ETH',
  //       icon: getTokenImage(token1Address),
  //     },
  //     {
  //       address: token2Address,
  //       symbol: 'DOUGH',
  //       icon: getTokenImage(tokenAddress),
  //     },
  //     {
  //       address: token3Address,
  //       symbol: 'DAI',
  //       icon: getTokenImage('token3Address),
  //     },
  //   ];

  let modal;
  let modalOption = {
    title: 'Review Quote',
    pieAddress: null,
    ovenAddress: null,
  };

  let targetModal = 'sell';
  let timeout;

  $: defaultTokenSell = usefulArray[0];

  let defaultTokenBuy = {
    address: buyTokenAddress,
    symbol: buyTokenSymbol,
    icon: getTokenImage(buyTokenAddress),
  };

  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0,
  };

  let tokenSelectModalOpen = false;
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (token) {
      if (targetModal === 'sell') {
        if (token === buyToken) {
          return;
        }
        sellToken = token;
      } else if (targetModal === 'buy') {
        if (token === sellToken) {
          return;
        }
        buyToken = current.route.params.address;
      }
      fetchQuote();
    }
  };

  const Timer = new Timeout(30000, () => {
    frozeQuote = null;
    fetchQuote(true);
  });

  const toNum = (num) => new BigNumber(num.toString()).dividedBy(10 ** 18).toFixed(6);

  let slippage = 0;
  let quote = null;

  let contract;

  $: if ($eth?.signer) {
    contract = new ethers.Contract(
      '0x8d1ce361eb68e9e05573443c407d4a3bed23b033',
      smartPoolAbi,
      $eth.signer,
    );
  }

  $: sellToken = defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = defaultAmount;
  $: receivedAmount = 0;
  $: frozeQuote = null;
  $: needAllowance = false;
  $: initialized = {
    onMount: false,
    onChainData: false,
  };
  $: isLoading = false;
  $: allowances = {};
  $: balances = {};
  $: error = null;
  $: showSlippageSettings = false;
  $: balanceError = false;

  $: if ($eth.address) {
    if (!initialized.onChainData && !isLoading) {
      isLoading = true;
      //   fetchOnchainData();
      initialized.onChainData = true;
      isLoading = false;
    }
  }

  onDestroy(() => {
    clearTimeout(timeout);
    Timer.stop();
  });

  onMount(async () => {
    isLoading = true;
    console.log('onMount');

    if ($eth.address) {
      //   await fetchOnchainData();
      initialized.onChainData = true;
    }
    await fetchQuote();
    initialized.onMount = true;
    isLoading = false;
  });

  //   function showBalanceError() {
  //     if (!balances[sellToken.address]) return;
  //     const weiAmount = amount.bn.toFixed(0);
  //     const shouldShowError = balances[sellToken.address].bn.isGreaterThanOrEqualTo(weiAmount)
  //       ? false
  //       : true;
  //     return shouldShowError;
  //   }

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if (allowance.isEqualTo(0)) return true;
    if (allowance.isGreaterThanOrEqualTo(amount.bn)) return false;
  }

  function changeSlippage(value) {
    slippage = value;
    showSlippageSettings = false;
  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    await approveMax(sellToken.address, ZeroEx);
    needAllowance = false;
    // await fetchOnchainData();
  }

  function onAmountChange() {
    const decimals = sellToken.decimals || 18;
    amount.bn = new BigNumber(amount.label).multipliedBy(10 ** decimals);
    fetchQuote();
  }

  //   async function fetchOnchainData() {
  //     // Fetch balances, allowance and decimals
  //     listed = await fetchBalances(listed, $eth.address, $eth.provider);

  //     if (sellToken) {
  //       sellToken = find(listed, ['address', sellToken.address], defaultTokenSell);
  //     } else {
  //       sellToken = defaultTokenSell;
  //     }

  //     if (buyToken) {
  //       buyToken = find(listed, ['address', buyToken.address], defaultTokenBuy);
  //     } else {
  //       buyToken = defaultTokenBuy;
  //     }

  //     listed.forEach((token) => {
  //       allowances[token.address] = token.allowance;
  //     });

  //     listed.forEach((token) => {
  //       balances[token.address] = token.balance;
  //     });
  //   }

  async function fetchQuote(selfRefresh = false, freeze = false) {
    if (!amount.label || amount.label === 0 || amount.label === '' || isLoading === true) {
      Timer.stop();
      return;
    }

    quote = {};

    let resp = await contract.callStatic.joinswapExternAmountIn(
      sellToken.address,
      ethers.utils.parseEther(amount.label.toFixed(2)),
      ethers.utils.parseEther('0'),
    );

    isLoading = false;

    Timer.start();

    if (freeze) {
      frozeQuote = quote;
    }
  }

  $: usefulArray = (() => {
    const newListed = [];
    for (const token of listed) {
      newListed.push({
        address: token.address,
        symbol: token.symbol,
        icon: getTokenImage(token.address),
      });
    }

    return newListed;
  })();

  async function swap() {
    if (!quote) {
      error = 'You need a quote first.';
      return;
    }

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    modal.close();

    const thing = await contract.callStatic.joinswapExternAmountIn();

    const { emitter } = displayNotification(
      await contract.joinswapExternAmountIn(
        // TODO fix this. Getting underflow errors converting quote.value into a BigNum
        sellToken.address,
        ethers.utils.parseUnits(quote.value, 'gwei'),
        0.01,
      ),
    );

    emitter.on('txConfirmed', ({ hash }) => {
      const { dismiss } = displayNotification({
        message: 'Confirming...',
        type: 'pending',
      });

      const subscription = subject('blockNumber').subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${amount.label.toFixed(2)} ${sellToken.symbol} swapped successfully`,
            type: 'success',
          });
          //   fetchOnchainData();
          amount = defaultAmount;
          dismiss();
          subscription.unsubscribe();
        },
      });

      return {
        autoDismiss: 1,
        message: 'Mined',
        type: 'success',
      };
    });
  }
</script>

<TokenSelectModal
  tokens={$eth.address ? orderBy(usefulArray, ['balance.number'], ['desc']) : usefulArray}
  open={tokenSelectModalOpen}
  callback={tokenSelectCallback}
/>

<Modal title={modalOption.title} backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <ReviewQuoteModal
      {fetchQuote}
      {quote}
      {buyToken}
      close={modal.close}
      {sellToken}
      {frozeQuote}
      confirm={swap}
      {isLoading}
    />
  </span>
</Modal>

<div class="swap-container flex flex-col items-center w-94pc p-60px bg-lightgrey md:w-50pc h-50pc">
  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
        {#if balances[sellToken.address]}
          <div
            on:click={() => {
              amount.label = balances[sellToken.address].number;
              amount.bn = balances[sellToken.address].bn;
              fetchQuote();
            }}
          >
            Max balance: {balances[sellToken.address].label}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex nowrap items-center p-1">
      <input
        class:error={balanceError}
        class="swap-input-from"
        on:focus={() => {
          amount.label = amount.label === 0 ? '' : amount.label;
        }}
        on:keyup={debounce(onAmountChange, 1000, { leading: false, trailing: true })}
        bind:value={amount.label}
        inputmode="decimal"
        title="Token Amount"
        autocomplete="off"
        autocorrect="off"
        type="number"
        pattern="^[0-9]*[.]?[0-9]*$"
        placeholder="0.0"
        minlength="1"
        maxlength="79"
        spellcheck="false"
      />
      <button
        class="swap-button"
        on:click={() => {
          targetModal = 'sell';
          tokenSelectModalOpen = true;
        }}
      >
        <span class="sc-iybRtq gjVeBU">
          <img
            class="h-auto w-24px mr-5px"
            alt={sellToken ? `${sellToken.symbol} logo` : ''}
            src={sellToken ? sellToken.icon : ''}
          />
          <span class="sc-kXeGPI jeVIZw token-symbol-container"
            >{sellToken ? sellToken.symbol : ''}</span
          >
          <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"
            ><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff" /></svg
          >
        </span>
      </button>
    </div>
  </div>

  <div class="my-20px">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#cccccc"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg
    >
  </div>

  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">To (estimated)</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <input
        class="swap-input-from"
        bind:value={receivedAmount}
        disabled
        inputmode="decimal"
        title="Token Amount"
        autocomplete="off"
        autocorrect="off"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder="0.0"
        minlength="1"
        maxlength="79"
        spellcheck="false"
      />
      <button class="cursor-default swap-button">
        <span class="sc-iybRtq gjVeBU cursor-default">
          <img
            class="h-auto w-24px mr-5px"
            alt={buyToken ? `${buyToken.symbol} logo` : ''}
            src={buyToken ? buyToken.icon : ''}
          />
          <span class="sc-kXeGPI jeVIZw token-symbol-container cursor-default"
            >{buyToken ? buyToken.symbol : ''}</span
          >
        </span>
      </button>
    </div>
  </div>

  {#if isLoading}
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Status:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">
        Finding the best price...
      </div>
    </div>
  {/if}

  {#if quote}
    <div class="flex items-center w-100pc pt-16px px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Price:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">
        1 {sellToken.symbol} @ {parseFloat(quote.price).toFixed(6)}
        {buyToken.symbol}
      </div>
    </div>
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Guaranteed Price:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">
        1 {sellToken.symbol} @ {parseFloat(quote.guaranteedPrice).toFixed(6)}
        {buyToken.symbol}
      </div>
    </div>
  {/if}
  <div class="flex items-center w-100pc px-16px justify-between mt-5px">
    <div class="flex nowrap intems-center p-1 font-thin">Max Slippage:</div>
    <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
      {#if showSlippageSettings}
        <button
          on:click={() => changeSlippage(1)}
          class:selected={slippage === 1}
          class="slippageBtn rounded-10px p-2px w-1.5">1%</button
        >
        <button
          on:click={() => changeSlippage(3)}
          class:selected={slippage === 3}
          class="slippageBtn rounded-10px p-2px w-1.5">3%</button
        >
        <button
          on:click={() => changeSlippage(5)}
          class:selected={slippage === 5}
          class="slippageBtn rounded-10px p-2px w-1.5">5%</button
        >
      {:else}
        <div
          on:click={() => {
            showSlippageSettings = true;
          }}
        >
          {slippage}%
        </div>
      {/if}
    </div>
  </div>

  {#if error}
    <button disabled={true} class="stake-button error rounded-20px mt-10px p-15px w-100pc">
      {error}
    </button>
  {:else if needAllowance}
    <button
      on:click={approveToken}
      class="btn clear stake-button mt-10px rounded-20px p-15px w-100pc">Approve</button
    >
  {:else}
    <button
      class:error={error || isLoading || balanceError ? true : false}
      on:click={() => {
        frozeQuote = quote;
        modal.open();
      }}
      disabled={error || isLoading || balanceError ? true : false}
      class="stake-button mt-10px rounded-20px p-15px w-100pc"
    >
      Review Order
    </button>
  {/if}
</div>
