<script>
  import { _ } from 'svelte-i18n';
  import debounce from 'lodash/debounce';
  import BigNumber from 'bignumber.js';
  import { onMount } from 'svelte';
  import orderBy from 'lodash/orderBy';
  import { ethers } from 'ethers';
  import smartPoolAbi from '../abis/smartPoolV2.json';
  import TokenSelectModal from '../components/modals/TokenSelectModal.svelte';
  import Modal from '../components/elements/Modal.svelte';
  import ReviewQuoteModal from '../components/modals/ReviewQuoteModal.svelte';
  import displayNotification from '../notifications';
  import { subject, approveMax, connectWeb3, eth } from '../stores/eth.js';
  import { fetchBalances } from '../helpers/multicall';
  import { getTokenImage } from '../components/helpers';

  // props
  export let listed = [];
  export let buyTokenAddress;
  export let buyTokenSymbol;

  // data
  let tokenList = [];
  let modal;
  let contract;
  let modalOption = {
    title: 'Review Quote',
    pieAddress: null,
    ovenAddress: null,
  };
  let slippage = 3;
  let quote = null;
  let targetModal = 'sell';
  let defaultTokenBuy = {
    address: buyTokenAddress,
    symbol: buyTokenSymbol,
    icon: getTokenImage(buyTokenAddress),
  };
  let tokenSelectModalOpen = false;

  // constants
  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0,
    decimals: 18
  };

  // computed props
  $: defaultSellToken = tokenList[0];
  $: sellToken = sellToken ? sellToken : defaultSellToken;
  $: buyToken = defaultTokenBuy;
  $: sellAmount = defaultAmount;
  $: amountWithSlippage = { bn: BigNumber(0), label: '0'};
  $: receivedAmount = 0;
  $: frozeQuote = null;
  $: needAllowance = false;
  $: isLoading = false;
  $: isFetchingQuote = false;
  $: error = null;
  $: showSlippageSettings = false;
  $: balanceError = (sellToken && sellAmount && sellToken?.balance && sellAmount.bn.isGreaterThan(sellToken.balance.bn));
  $: tokensLoaded = tokenList.length > 0;
  $: sellTokenDecimals = sellToken?.decimals;
  $: entry = true;

  const invertSellToken = (selected) => {
    entry = !entry;

    console.debug({ entry })

    const cacheBuyToken = buyToken;
    // buy token is the bottom
    buyToken = sellToken;

    // sell token 
    sellToken = cacheBuyToken;
  };

  $: console.debug({ buyToken, sellToken })

  // watchers
  $: if ($eth?.signer) {
    contract = new ethers.Contract(buyTokenAddress, smartPoolAbi, $eth.signer);
  }

  $: if (sellToken && sellToken.address && $eth.address && !sellToken.balance) {
    const items = [
      ETH,
      {
        address: sellToken.address,
        symbol: sellToken.symbol,
        icon: getTokenImage(sellToken.address)
      }
    ];
    fetchBalances(
        items, 
        $eth.address,
        $eth.provider,
        contract.address,
      ).then((balances) => {
      balances.forEach((token, idx) => {
        if (idx > 0) {
          console.debug({ token })
          sellToken = token;       
          checkUpdateAllowance(token)
        }
      });
    });    
  }

  const ETH = {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
    icon: getTokenImage('eth')
  };

  // This block will set up the token data that this component will use.
  // all changes to tokenList should happen in this block.
  $: {
    const newListed = [
      // fetchBalances expects ETH as first token
      ETH,
    ];

    for (const token of listed) {
      newListed.push({
        address: token.address,
        symbol: token.symbol,
        icon: getTokenImage(token.address),
      });
    }

    if (newListed.length > 0 && $eth.address) {
      fetchBalances(
          newListed, 
          $eth.address,
          $eth.provider,
          contract.address,
        ).then((balances) => {
        balances.forEach((token) => {
          const tokenIdx = newListed.findIndex((t) => t.address === token.address);
          newListed[tokenIdx].balance = token.balance;
          newListed[tokenIdx].allowance = token.allowance;
          newListed[tokenIdx].decimals = token.decimals;
          checkUpdateAllowance(token)
        });

        // remove eth as not revelant
        tokenList = newListed.filter(item => item.symbol !=='ETH');
      });
    }
  };

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if (allowance.isEqualTo(0)) return true;
    if (allowance.isGreaterThanOrEqualTo(sellAmount.bn)) return false;
  }

  // update the selltoken approval when data comes in
  const checkUpdateAllowance = (token) => {
    if (sellToken?.allowance && token.address === sellToken.address) {
      needAllowance = needApproval(token.allowance);
    }
  }
  
  $: {
    // constrain form inputs to > 0
    if (sellAmount && sellAmount.label < 0) sellAmount.label = 0;
  };

  // methods
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (!token) return;
    if (targetModal === 'sell' && token !== buyToken) {
      sellToken = token;
    } else if (targetModal === 'buy' && token !== sellToken) {
      buyToken = token;
    };
    fetchQuote();
  };
  
  const toNum = (num) => {
    const bn = new BigNumber(num.toString());
    const result = bn.dividedBy(10 ** 18).toFixed(6);
    return result
  }


  // function changeMaxInputToken(slippage) {
    
  // }

  function changeSlippage(value) {
    slippage = value;
    const slipPc = 1 + slippage/100;
    amountWithSlippage = {
      bn: BigNumber(quote.buyAmount).dividedToIntegerBy(slipPc),
      label: parseFloat(quote.buyLabel / slipPc).toString(),
    };

    quote = {
      ...quote,
      guaranteedPrice: BigNumber(quote.buyPrice).dividedToIntegerBy(slipPc),
      guaranteedLabel: parseFloat(quote.label) / slipPc,
      amountWithSlippageLabel: amountWithSlippage.label,
      amountWithSlippageBn: amountWithSlippage.bn,
    };
  }

  function checkWalletConnection() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }
  }

  async function approveToken() {
    checkWalletConnection();

    isLoading = true;

    const spender = entry ? buyToken.address : contract.address;
    try {
      await approveMax(sellToken.address, spender);
      needAllowance = false;
    } finally {
      isLoading = false;
    }
  }

  function onAmountChange() {
    sellAmount.bn = new BigNumber(sellAmount.label).multipliedBy(10 ** sellTokenDecimals);
    fetchQuote();
  }

  const assetEntryQuotes = async () => {
    return await Promise.all([
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.BigNumber.from(sellAmount.bn.toFixed(0))
        ),
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.utils.parseUnits('1.0', sellTokenDecimals)
        )
    ]);
  };

  const assetExitQuotes = async () => {
    console.debug('calling exit', { sellToken, contract })
    return await Promise.all([
        contract.calcSingleOutGivenPoolIn(
          buyToken.address,
          ethers.BigNumber.from(sellAmount.bn.toFixed(0))
        ),
        contract.calcSingleOutGivenPoolIn(
          buyToken.address,
          ethers.utils.parseUnits('1.0', sellTokenDecimals)
        )
    ]);
  };

  const fetchQuote = async (selfRefresh = false, freeze = false) => {
    if (!sellAmount.label || isLoading || isFetchingQuote) {
      return;
    }
    isLoading = true;
    isFetchingQuote = true;

    needAllowance = needApproval(sellToken.allowance);

    try {
      const [fullQuote, perUnit] = entry ? await assetEntryQuotes() : await assetExitQuotes();
      quote = {
        ...quote,
        sellAmount: sellAmount.bn,
        sellLabel: sellAmount.label,
        buyAmount: fullQuote.toString(),
        buyLabel: ethers.utils.formatEther(fullQuote),
        buyPrice: perUnit.toString(),
        value: perUnit.toString(),
        label: ethers.utils.formatEther(perUnit),
      };

      if (slippage) {
        changeSlippage(slippage)
      }

      receivedAmount = toNum(quote.buyAmount)

      if (freeze) {
        frozeQuote = quote;
      }
    } catch (err) {
      displayNotification({
        autoDismiss: 15000,
        message: err.message,
        type: 'error',
      })
    } finally {
      isLoading = false;
      isFetchingQuote = false
    }
  };

  const reduceSellTokenBalance = () => {
    if (sellAmount.bn.isGreaterThan(sellToken.balance.bn)) return;

    const parsedAmount = parseFloat(sellAmount.label);
    const parsedBalance = parseFloat(sellToken.balance.label);

    // rounding errors can lead to negative labels
    const label = Math.max(0, parsedBalance - parsedAmount).toString();
    const number = Math.max(0, sellToken.balance.number - parsedAmount);

    sellToken.balance = {
      bn: sellToken.balance.bn.minus(sellAmount.bn),
      label,
      number
    }
  }

  const entrySwap = async () => {
    return await contract.joinswapExternAmountIn(
      sellToken.address,
      sellAmount.bn.toString(),
      amountWithSlippage.bn.toString()
    );    
  };

  const exitSwap = async () => {
    console.debug({ buyToken, quote, sellToken, contract, sellAmount })
    return await contract.exitswapExternAmountOut(
      buyToken.address,
      sellToken.balance.bn.toString(),
      sellToken.balance.bn.toString()
    );
  };

  async function swap() {
    
    try {
      if (!quote || Object.entries(quote).length === 0) {
        error = 'You need a quote first.';
        return;
      }

      checkWalletConnection();

      isLoading = true;

      // avoid scientific notation
      BigNumber.set({ EXPONENTIAL_AT: 99 });

      const tx = entry ? await entrySwap() : await exitSwap();

      const { emitter } = displayNotification(
        tx
      );

      reduceSellTokenBalance();
      sellAmount = defaultAmount;
      modal.close();

      emitter.on('txConfirmed', ({ hash }) => {
        const { dismiss } = displayNotification({
          message: 'Confirming...',
          type: 'pending',
        });

        const subscription = subject('blockNumber').subscribe({
          next: () => {
            displayNotification({
              autoDismiss: 15000,
              message: `${sellAmount.label.toFixed(2)} ${sellToken.symbol} swapped successfully`,
              type: 'success',
            });

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
    } catch (err) {
      displayNotification({
        message: error ? error : err.message,
        type: 'error'
      })
    } finally {
      isLoading = false;
      if (modal.modalIsOpen()) modal.close();
    }
  };

  const setMaxTokenValue = () => {
    sellAmount.bn = sellToken.balance.bn;
    sellAmount.label = sellToken.balance.number;
  };


  // lifecylces
  onMount(async () => {
    await fetchQuote();
  });
</script>
<TokenSelectModal
  tokens={$eth.address ? orderBy(tokenList, ['balance.number'], ['desc']) : tokenList}
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
      includeMarket={false}
    />
  </span>
</Modal>

<div class="swap-container flex flex-col items-center bg-lightgrey">
  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From:{!entry ? ' (estimated)' : ''}</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
          <button
          on:click={() => {
              setMaxTokenValue();
              fetchQuote();
          }}
          >
            Balance: {sellToken?.balance?.label ?? 0}
        </button>
      </div>
    </div>
    <div class="flex nowrap items-center p-1">
      <input
        class:error={balanceError}
        class="swap-input-from"
        on:focus={() => {
          sellAmount.label = sellAmount.label === 0 ? '' : sellAmount.label;
        }}
        on:keyup={debounce(onAmountChange, 1000, { leading: false, trailing: true })}
        bind:value={sellAmount.label}
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
        disabled={!entry}
        on:click={() => {
          targetModal = 'sell';
          tokenSelectModalOpen = true;
        }}
      >
        <span class="sc-iybRtq gjVeBU">
          {#if tokensLoaded}
          <img
            class="h-auto w-24px mr-5px"
            alt={sellToken ? `${sellToken.symbol} logo` : 'loading tokens'}
            src={sellToken ? sellToken.icon : ''}
          />
          {/if}
          <span class="sc-kXeGPI jeVIZw token-symbol-container"
            >{sellToken ? sellToken.symbol : 'Loading...'}</span
          >
          {#if entry && tokensLoaded}
          <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"
            ><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff" /></svg
          >
          {/if}
        </span>
      </button>
    </div>
  </div>

  <div 
    class={`my-20px transform ${entry ? 'rotate-0' : 'rotate-180'} transition-transform delay-75`}
    on:click={() => invertSellToken()}
    >
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
      ><line x1="12" y1="5" x2="12" y2="19" /><polyline 
      points="19 12 12 19 5 12" /></svg
    >   
  </div>

  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">To{entry ? ' (estimated)' : ''}</div>
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
      <button
        class="swap-button"
        disabled={entry}
        on:click={() => {
          targetModal = 'buy';
          tokenSelectModalOpen = true;
        }}
      >
        <span class="sc-iybRtq gjVeBU">
          {#if tokensLoaded}
          <img
            class="h-auto w-24px mr-5px"
            alt={buyToken ? `${buyToken.symbol} logo` : ''}
            src={buyToken ? buyToken.icon : ''}
          />
          {/if}
          <span class="sc-kXeGPI jeVIZw token-symbol-container"
            >{buyToken ? buyToken.symbol : ''}</span
          >
          {#if !entry && tokensLoaded}
          <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"
            ><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff" /></svg
          >
          {/if}
        </span>
      </button>      
    </div>
  </div>

  {#if isFetchingQuote}
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Status:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">
        Finding the best price...
      </div>
    </div>
  {/if}

  {#if quote && Object.entries(quote).length > 0}
    <div class="flex items-center w-100pc pt-16px px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Price:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">
        1 {sellToken.symbol} @ {parseFloat(String(quote.label) ?? '0.0').toFixed(6)}
        {buyToken.symbol}
      </div>
    </div>
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Minimum Price:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">1 {sellToken.symbol} @ {parseFloat(quote.guaranteedLabel).toFixed(6)} {buyToken.symbol}</div>
    </div>
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">{entry ? 'Minimum Amount' : 'Maximum Cost'}:</div>
      1145 BCP
      <!-- <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">{amountWithSlippage && amountWithSlippage.label ? parseFloat(amountWithSlippage.label).toFixed(6) : 0} {buyToken.symbol}</div> -->
    </div>        
  <div 
    on:click={() => showSlippageSettings = !showSlippageSettings}
    class="cursor-pointer flex items-center w-100pc px-16px justify-between mt-5px">
    <div class="flex nowrap intems-center p-1 font-thin">Max { entry ? 'Slippage' : 'Premium'}:</div>
    <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin">
      {#if true}
      <section>
        {#each [1, 3, 5] as slippagePercentage}
          <button
            on:click={() => changeSlippage(slippagePercentage)}
            class:selected={slippage === slippagePercentage}
            class="slippageBtn px-2 transition-colors delay-75">{slippagePercentage + '%'}</button
          >
        {/each}
      </section>
      {:else}
        <p class="font-bold">
          {slippage}%
        </p>
      {/if}
    </div>
  </div>
  {/if}


  {#if error}
    <button disabled class="stake-button error rounded-20px mt-10px p-15px w-100pc">
      {error}
    </button>
  {:else if needAllowance}
    <button
      disabled={error || isLoading}
      on:click={() => approveToken().then(() => needAllowance = false)}
      class="btn clear stake-button disabled:text-gray-200 disabled:border-grey-200 mt-10px rounded-20px p-15px w-100pc">
        { isLoading ? 'Loading...' : 'Approve'}
      </button
    >
  {:else}
    <button
      class:error={error || isLoading || balanceError}
      on:click={() => {
        frozeQuote = quote;
        modal.open();
      }}
      disabled={error || isLoading || balanceError || sellAmount.label === 0}
      class="stake-button mt-10px rounded-20px p-15px w-100pc"
    >
      { balanceError ? 'Insufficient Balance' : isLoading ? 'Loading...' :  'Review Order' }
    </button>
  {/if}
</div>
