<script>
  import { Timeout } from './../classes/Timer.js';
  import { _ } from 'svelte-i18n';
  import debounce from 'lodash/debounce';
  import BigNumber from 'bignumber.js';
  import { onMount, onDestroy } from 'svelte';
  import orderBy from 'lodash/orderBy';
  import { ethers } from 'ethers';
  import smartcontracts from '../config/smartcontracts.json';
  import smartPoolAbi from '../abis/smartPoolV2.json';
  import TokenSelectModal from '../components/modals/TokenSelectModal.svelte';
  import Modal from '../components/elements/Modal.svelte';
  import ReviewQuoteModal from '../components/modals/ReviewQuoteModal.svelte';
  import displayNotification from '../notifications';
  import { currentRoute } from '../stores/routes.js';
  import { subject, approveMax, connectWeb3, eth, allowances   } from '../stores/eth.js';
  import { fetchBalances } from '../helpers/multicall';
  import { getTokenImage } from '../components/helpers';
import erc20 from '@pie-dao/abis/src/abis/erc20';

  // props
  export let listed = [];
  export let buyTokenAddress;
  export let buyTokenSymbol;

  // data
  let tokenList = [];
  let modal;
  let contract;
  let timeout;
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
  };

  // computed props
  $: defaultTokenSell = tokenList[0];
  $: sellToken = sellToken ? sellToken : defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = defaultAmount;
  $: amountWithSlippage = { bn: BigNumber(0), label: '0'};
  $: receivedAmount = 0;
  $: frozeQuote = null;
  $: needAllowance = false;
  $: isLoading = false;
  $: error = null;
  $: showSlippageSettings = false;
  $: balanceError = (sellToken && amount && sellToken?.balance && amount.bn.isGreaterThan(sellToken.balance.bn));
  
  // watchers
  $: if ($eth?.signer) {
    contract = new ethers.Contract($currentRoute.params.address, smartPoolAbi, $eth.signer);
  }
  
  // This block will set up the token data that this component will use.
  // all changes to tokenList should happen in this block.
  $: {
    const newListed = [
      // fetchBalances expects ETH as first arg
      {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        symbol: 'ETH',
        icon: getTokenImage('eth')
      }    
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
        });

        // remove eth as not revelant
        tokenList = newListed.filter(item => item.symbol !== 'ETH');
      });
    }
  };

  $: {
    // constrain form inputs to > 0
    if (amount && amount.label < 0) amount.label = 0;
  };

  // methods
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (!token) return;
    if (targetModal === 'sell' && token !== buyToken) {
      sellToken = token;
    } else if (targetModal === 'buy' && token !== sellToken) {
      buyToken = $currentRoute.params.address;
    };
    fetchQuote();
  };

  const Timer = new Timeout(30000, () => {
    frozeQuote = null;
    fetchQuote(true);
  });

  const toNum = (num) => new BigNumber(num.toString()).dividedBy(10 ** 18).toFixed(6);

  function needApproval(allowance) {
    if (!$eth.address || !$eth.signer) return false;
    if (allowance.isEqualTo(0)) return true;
    if (allowance.isGreaterThanOrEqualTo(amount.bn)) return false;
  }

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
    };

  }

  async function approveToken() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    isLoading = true;

    try {
      const { emitter } = displayNotification(
        await approveMax(sellToken.address, smartcontracts.defi_pp)
      );

      emitter.on('txConfirmed', () => {
        const { dismiss } = displayNotification({
          message: 'Confirming...',
          type: 'pending',
        });

        const subscription = subject('blockNumber').subscribe({
          next: () => {
            displayNotification({
              autoDismiss: 15000,
              message: 'Approved successfully',
              type: 'success',
            });
            amount = defaultAmount;
            dismiss();
            subscription.unsubscribe();
          }
        });

        needAllowance = false; 
      
      });

    } catch (err) {
      displayNotification({
        message: err,
        type: 'error'
      })
    } finally {
      isLoading = false;
    }
  }

  function onAmountChange() {
    const decimals = sellToken.decimals || 18;
    amount.bn = new BigNumber(amount.label).multipliedBy(10 ** decimals);
    fetchQuote();
  }

  const fetchQuote = async (selfRefresh = false, freeze = false) => {
    if (!amount.label || amount.label === 0 || amount.label === '' || isLoading === true) {
      Timer.stop();
      return;
    }
    isLoading = true;

    needAllowance = needApproval(sellToken.allowance);

    try {
      const [fullQuote, perUnit] = await Promise.all([
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.BigNumber.from(amount.bn.toFixed(0))
        ),
        contract.calcPoolOutGivenSingleIn(
          sellToken.address,
          ethers.utils.parseEther('1.0')
        )
      ]);

      quote = {
        ...quote,
        sellAmount: amount.bn,
        sellLabel: amount.label,
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
      Timer.start();

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
    }
  };

  async function swap() {
    
    try {
      if (!quote || Object.entries(quote).length === 0) {
        error = 'You need a quote first.';
        return;
      }

      if (!$eth.address || !$eth.signer) {
        displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
        connectWeb3();
        return;
      }
      isLoading = true;
      modal.close();

      console.debug({
        sellToken, amount: amount.bn.toString(), amountWithSlippage: amountWithSlippage.bn.toString()
      })
      const { emitter } = displayNotification(
        await contract.joinswapExternAmountIn(
          sellToken.address,
          amount.bn.toString(),
          amountWithSlippage.bn.toString()
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
    } catch (err) {
      displayNotification({
        message: error ? error : err.message,
        type: 'error'
      })
    }
  };

  const setMaxTokenValue = () => {
    const token = tokenList.find(t => t.address === sellToken.address);
    if (!token) return displayNotification({
      message: 'Error selecting token',
      type: 'err',
      autoDismiss: 15_000
    });

    amount.bn = token.balance.bn;
    amount.label = token.balance.number;
  };

  // lifecycles
  onDestroy(() => {
    clearTimeout(timeout);
    Timer.stop();
  });

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
      <div class="flex nowrap intems-center p-1 font-thin">From</div>
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
      <div class="flex nowrap intems-center p-1 font-thin">Minimum Amount:</div>
      <div class="sc-kkGfuU hyvXgi css-1qqnh8x font-thin" style="display: inline;">{parseFloat(amountWithSlippage.label).toFixed(6)} {buyToken.symbol}</div>
    </div>        
  <div 
    on:click={() => showSlippageSettings = !showSlippageSettings}
    class="cursor-pointer flex items-center w-100pc px-16px justify-between mt-5px">
    <div class="flex nowrap intems-center p-1 font-thin">Max Slippage:</div>
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
    <button disabled={true} class="stake-button error rounded-20px mt-10px p-15px w-100pc">
      {error}
    </button>
  {:else if needAllowance}
    <button
      disabled={error || isLoading}
      on:click={approveToken}
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
      disabled={error || isLoading || balanceError || amount.label <= 0}
      class="stake-button mt-10px rounded-20px p-15px w-100pc"
    >
      { balanceError ? 'Insufficient Balance' : isLoading ? 'Loading...' :  'Review Order' }
    </button>
  {/if}
</div>
