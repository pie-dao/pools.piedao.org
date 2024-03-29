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
  export let allowExit;

  // data
  let entry = true;
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
  let defaultTokenBuy = {
    address: buyTokenAddress,
    symbol: buyTokenSymbol,
    icon: getTokenImage(buyTokenAddress),
  };
  let tokenSelectModalInOpen = false;
  let tokenSelectModalOutOpen = false;

  // constants
  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0,
    decimals: 18
  };

  // computed props
  $: defaultSellToken = tokenList[0];
  $: sellToken = sellToken ?? defaultSellToken;
  $: buyToken = defaultTokenBuy;
  $: sellAmount = defaultAmount;
  $: amountWithSlippage = { bn: BigNumber(0), label: '0'};
  $: receivedAmount = 0;
  $: frozeQuote = null;
  $: needAllowance = false;
  $: isLoading = false;
  $: isFetchingQuote = false;
  $: isConfirmingTx = false;
  $: error = null;
  $: showSlippageSettings = false;
  $: balanceError = sellTokenHasBalanceError(sellToken, sellAmount);
  $: tokensLoaded = tokenList.length > 0;
  // assume the initial 'buy' token is also capable of exit
  $: exitToken = allowExit ? defaultTokenBuy : null;
  $: entry = allowExit ? (buyToken ? buyToken.address === defaultTokenBuy.address : false) : true;
  $: buyTokenList = entry ? [defaultTokenBuy] : tokenList.filter(t => t.address !== exitToken.address);
  $: available = `${sellToken?.balance?.label ?? 0}`;
  $: sellTokenDecimals = sellToken?.decimals ?? (sellToken?.symbol === 'WBTC' ? 8 : 18);
  $: buyTokenDecimals = buyToken?.decimals ?? (buyToken?.symbol === 'WBTC' ? 8 : 18);


  // watchers
  $: if ($eth) {
    contract = new ethers.Contract(buyTokenAddress, smartPoolAbi, $eth?.signer ?? $eth.provider);
  }; 

  const sellTokenHasBalanceError = (token, amount) => {
    // missing data will throw error
    if (!token || !amount) return true;
    if (!token.balance) return true;
    if (amount.bn.isGreaterThan(token.balance.bn)) return true;
    return false;
  };

  const ethereum = {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
    icon: getTokenImage('eth')
  };

  const createTokenList = list => list.map(token => ({
    address: token.address,
    symbol: token.symbol,
    icon: getTokenImage(token.address),
  }))

  // This block will set up the token data that this component will use.
  // all changes to tokenList should happen in this block.
  $: {
    // fetchBalances expects ETH as first token
    const newListed = [
      ethereum,
      ...createTokenList(listed),
    ];

    if (exitToken) newListed.push({
      address: exitToken.address,
      symbol: exitToken.symbol,
      icon: getTokenImage(exitToken.address)
    });

    if (newListed.length > 0 && $eth.address) {
      fetchBalances(
          newListed, 
          $eth.address,
          $eth.provider,
          contract.address,
        ).then((balances) => {
        balances.forEach((token) => {

          const tokenIdx = newListed.findIndex(t => t.address === token.address);
          newListed[tokenIdx].balance = token.balance;
          newListed[tokenIdx].allowance = token.allowance;
          newListed[tokenIdx].decimals = token.decimals;
          checkUpdateAllowance(token)
        });

        // remove eth as not revelant
        tokenList = newListed.filter(item => item.symbol !=='ETH');
      }) 
      
      // ensures the token list is fetched even if the wallet is not connected
    } else if (!$eth.address) {
      tokenList = [
        ...createTokenList(listed),
        exitToken,
      ];
    }
  };

  $: {
    if (sellToken && $eth.address && !sellToken.balance) {
      const getTokens = [ethereum, sellToken];
      fetchBalances(
            getTokens, 
            $eth.address,
            $eth.provider,
            contract.address,
        ).then((balances) => {
          balances.forEach((token, idx) => {
            if (idx === 0) return;
            sellToken.balance = token.balance;
            sellToken.allowance = token.allowance;
            sellToken.decimals = token.decimals;
            checkUpdateAllowance(token);
          }
        );
      })
    }
  }

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if (!allowance || allowance.isEqualTo(0)) return true;
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


  const setSellToken = (token) => {
      // Selling controls the top
      // if we change the sell token, first we do nothing if the token is the same
      if (sellToken.address === token.address) return false;

      // in the case of exit, the buyToken must always be the exit token
      if (!entry) buyToken = exitToken;
     
      // if the new token is the same as the buy token, we need to change the buy token
      if (token.address === buyToken.address) {
        // if sell token is not the exit token, buy token will be the exit token
        if (token.address !== exitToken.address) buyToken = exitToken;
        else buyToken = tokenList[0];
      };

      // finally set the sell token and add balance based on premium
      sellToken = token;

      // success allows outer function to proceed
      return true
  };

  const setBuyToken = (token) => {
      // ignore if no change
      if (buyToken.address === token.address) return false;

      // if the buy token is not the exitToken, the sellToken must be the exitToken
      if (!entry) sellToken = exitToken;

      // in the case of a collision, we need to change the sellToken
      if (token.address === sellToken.address) {
        // if sell token is not the exit token, buy token will be the exit token
        if (token.address === exitToken.address) sellToken = exitToken;
        // else find another token
        else sellToken = tokenList.find(t => t.address !== token.address);
      }
      // finally set the buy token
      buyToken = token;
      // success allows outer function to proceed
      return true;
  }

  const tokenSelectCallback = (token, sell = true) => {
    tokenSelectModalInOpen = false;
    tokenSelectModalOutOpen = false;
    
    if (!token) return;

    const change = sell ? setSellToken(token) : setBuyToken(token);

    if (!change) return;

    sellAmount = defaultAmount;
    fetchQuote();
  };
  
  const toNum = (num, decimals = 18) => {
    const bn = new BigNumber(num.toString());
    const result = bn.dividedBy(10 ** decimals).toFixed(6);
    return result
  };

  function getQuoteWithSlippage(baseQuote, slipPc) {    
    amountWithSlippage = {
      bn: BigNumber(quote.buyAmount).dividedToIntegerBy(slipPc),
      label: parseFloat(quote.buyLabel / slipPc).toString(),
    };
    quote = {
      ...baseQuote,
      amountWithSlippageLabel: amountWithSlippage.label,
      amountWithSlippageBn: amountWithSlippage.bn,
    };
  }

  function changeSlippage(value) {
    // sets the component slippage
    slippage = value;
    const slipPc = 1 + slippage/100;
    const baseQuote = {
      ...quote,
      guaranteedPrice: BigNumber(quote.buyPrice).dividedToIntegerBy(slipPc),
      guaranteedLabel: parseFloat(quote.label) / slipPc,
    };

    getQuoteWithSlippage(baseQuote, slipPc);
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
      sellToken.allowance = ethers.constants.MaxUint256;
    } finally {
      isLoading = false;
    }
  }

  function onAmountChange() {
    sellAmount.bn = new BigNumber(sellAmount.label).multipliedBy(10 ** sellTokenDecimals)
    fetchQuote();
  }

  const fetchQuoteEntry = async () => {
    return await Promise.all([
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.BigNumber.from(sellAmount.bn.toFixed(0))
        ),
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.utils.parseUnits('1.0', sellTokenDecimals)
        )
    ])
  };

  const fetchQuoteExit = async () => {
    return await Promise.all([
      contract.calcSingleOutGivenPoolIn(
        buyToken.address,
        ethers.BigNumber.from(sellAmount.bn.toFixed(0)),
      ),
      contract.calcSingleOutGivenPoolIn(
        buyToken.address,
        ethers.utils.parseUnits('1.0', sellTokenDecimals),
      ),
    ])
  };  

  const fetchQuote = async (selfRefresh = false, freeze = false) => {
    if (!sellAmount.label || isLoading || isFetchingQuote) return;
    isLoading = true;
    isFetchingQuote = true;

    // avoid scientific notation
    BigNumber.set({ EXPONENTIAL_AT: 99 });

    // race condition means we need to force an update here
    entry = sellToken.address === exitToken.address ? false : true;

    needAllowance = needApproval(sellToken.allowance);

    try {
      const [fullQuote, perUnit] = entry ? await fetchQuoteEntry() : await fetchQuoteExit();

      quote = {
        ...quote,
        sellAmount: sellAmount.bn,
        sellLabel: sellAmount.label,
        buyAmount: fullQuote.toString(),
        buyLabel: ethers.utils.formatUnits(fullQuote, buyTokenDecimals ?? 18),
        buyPrice: perUnit.toString(),
        value: perUnit.toString(),
        label: ethers.utils.formatUnits(perUnit, buyTokenDecimals ?? 18),
      };

      if (slippage) changeSlippage(slippage);
      
      receivedAmount = toNum(quote.buyAmount, buyTokenDecimals ?? 18);
      
      if (freeze) frozeQuote = quote;

    } catch (err) {
      // error when trying to fetch quote that is too large (eg 1000 WBTC) reset the quote forcing a UI re-prompt
      if (JSON.stringify(err).includes('ERR_BPOW_BASE_TOO_HIGH') || JSON.stringify(err).includes('ERR_SUB_UNDERFLOW') ) {
        sellAmount = defaultAmount;
        quote = null;
        displayNotification({
          autoDismiss: 15000,
          message: 'Could not get a quote - try reducing the amount of tokens for sale.',
          type: 'error',
      })        
        return;
      };
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

  const singleAssetEntry = async () => {
    return await contract.joinswapExternAmountIn(
      sellToken.address,
      sellAmount.bn.toString(),
      amountWithSlippage.bn.toString()
    );
  }

  const singleAssetExit = async () => {
    const quantity = sellAmount.bn.toString();
    return await contract.exitswapPoolAmountIn(
      buyToken.address,
      quantity,
      amountWithSlippage.bn.toString()
    );
  }

  async function swap() {
    // fix issues with BN casting scientific notation
    BigNumber.set({ EXPONENTIAL_AT: 99 });
    try {
      if (!quote || Object.entries(quote).length === 0) {
        error = 'You need a quote first.';
        return;
      }

      checkWalletConnection();

      isLoading = true;

      // avoid scientific notation
      BigNumber.set({ EXPONENTIAL_AT: 99 });

      const tx = entry ? await singleAssetEntry() : await singleAssetExit();
      const { emitter } = displayNotification(tx);

      reduceSellTokenBalance();
      sellAmount = defaultAmount;
      modal.close();
      isConfirmingTx = true;
      emitter.on('txConfirmed', () => {
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
            isConfirmingTx = false;
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

  const setMax = () => {
    setMaxTokenValue();
    fetchQuote();
  };

  const setMaxTokenValue = () => {
    sellAmount.bn = sellToken.balance.bn;
    sellAmount.label = sellToken.balance.number.toFixed(6);
  };

  // lifecycle hooks
  onMount(async () => await fetchQuote());

</script>
<TokenSelectModal
  tokens={$eth.address ? orderBy(tokenList, ['balance.number'], ['desc']) : tokenList}
  open={tokenSelectModalInOpen}
  callback={t => tokenSelectCallback(t, true)}
/>

<TokenSelectModal
  tokens={buyTokenList}
  open={tokenSelectModalOutOpen}
  callback={t => tokenSelectCallback(t, false)}
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

<div class="swap-container flex flex-col items-center bg-lightgrey max-h-100pc">
  <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px">
    <div class="flex items-center justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">From:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline; cursor: pointer;">
          <button
          disabled={!$eth.address}
          on:click={setMax}
          >
            Available: {available}
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
        on:click={() => {
          tokenSelectModalInOpen = true;
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
          {#if tokensLoaded}
          <svg width="20" height="10" viewBox="0 0 12 7" fill="none" class="sc-iQtOjA kPBzbj ml-1"
            ><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#ffffff" /></svg
          >
          {/if}
        </span>
      </button>
    </div>
  </div>

  <div 
    class='my-20px'
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
      <div class="flex nowrap intems-center p-1 font-thin">To (estimated):</div>
    </div>
    <div class="flex nowrap items-center p-1">
      <input
        class="swap-input-from"
        bind:value={receivedAmount}
        inputmode="decimal"
        disabled
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
        tokenSelectModalOutOpen = true;
      }}
    >
      <span class="sc-iybRtq gjVeBU">
        <img
          class="h-auto w-24px mr-5px"
          alt={buyToken ? `${buyToken.symbol} logo` : 'Loading Tokens'}
          src={buyToken ? buyToken.icon : ''}
        />
        <span class="sc-kXeGPI jeVIZw token-symbol-container"
        >{buyToken ? buyToken.symbol : 'Loading...'}</span
        >
        {#if !entry}
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
    {#if entry}
    <div class="flex items-center w-100pc px-16px justify-between">
      <div class="flex nowrap intems-center p-1 font-thin">Minimum Amount:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">{amountWithSlippage && amountWithSlippage.label ? parseFloat(amountWithSlippage.label).toFixed(6) : 0} {buyToken.symbol}</div>
    </div>
    {/if}   
  <div 
    on:click={() => showSlippageSettings = !showSlippageSettings}
    class="cursor-pointer flex items-center w-100pc px-16px justify-between mt-5px">
    <div class="flex nowrap intems-center p-1 font-thin">Max Slippage</div>
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
      disabled={error || isLoading || balanceError || sellAmount.label === 0 || isConfirmingTx}
      class="stake-button mt-10px rounded-20px p-15px w-100pc"
    >
      { 
        balanceError
          ? 'Insufficient Balance'
          : isLoading
            ? 'Loading...'
            : isConfirmingTx
              ? 'Swap In Progress...'
              : 'Review Order'
      }
    </button>
  {/if}
</div>
