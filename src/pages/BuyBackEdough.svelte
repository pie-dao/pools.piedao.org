<script>
  import { onMount } from 'svelte';
  import { eth, subject } from '../stores/eth.js';
  import { getTokenImage } from '../components/helpers';
  import { fetchBalances } from '../helpers/multicall';
  import { _ } from 'svelte-i18n';
  import BigNumber from 'bignumber.js';
  import displayNotification from '../notifications';
  import { ethers } from 'ethers';
  import buyBackEdoughAbi from '../abis/buyBackEdoughAbi.json';
  import rewardEscrowAbi from '../abis/rewardEscrowAbi.json';
  import erc20Abi from '../abis/erc20ABI.json';
  import contracts from '../config/smartcontracts.json';
  import LightFarming from '../components/piefolio/LightFarming.svelte';
  import { formatFiat, formatToken } from '../components/helpers.js';

  const baseListed = [
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      icon: getTokenImage('eth'),
      decimals: 18,
    },
    {
      address: '0x63cbd1858bd79de1a06c3c26462db360b834912d',
      symbol: 'eDOUGH',
      icon: getTokenImage('0xad32A8e6220741182940c5aBF610bDE99E737b2D'),
      decimals: 18,
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      icon: getTokenImage('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      decimals: 6,
    },
  ];

  $: listed = baseListed;

  let defaultTokenSell = baseListed.find((l) => l.symbol === 'eDOUGH');
  let defaultTokenBuy = baseListed.find((l) => l.symbol === 'USDC');

  const defaultAmount = {
    bn: new BigNumber(0),
    label: 0,
  };

  const toNum = (num, decimals = 18) =>
    Number(
      BigNumber(num.toString())
        .dividedBy(10 ** decimals)
        .toFixed(2),
    );

  const toNumFixed = (num, decimals = 18) =>
    Number(
      BigNumber(num.toString())
        .dividedBy(10 ** decimals)
        .toFixed(4),
    );

  $: sellToken = defaultTokenSell;
  $: buyToken = defaultTokenBuy;
  $: amount = defaultAmount;
  $: receivedAmount = 0;
  $: needAllowance = false;
  $: initialized = {
    onMount: false,
    onChainData: false,
  };
  $: isLoading = false;
  $: allowances = {};
  $: balances = {};
  $: error = null;
  $: balanceError = false;
  $: availableToBuy = 0;
  $: tokenPrice = 0;
  $: poolUSDC = 0;

  let buyBackContract;
  let rewardEscrowContract;

  $: if ($eth.address) {
    if (!initialized.onChainData && !isLoading) {
      isLoading = true;
      fetchBuyBack();
      initialized.onChainData = true;
      isLoading = false;
    }
  }

  onMount(async () => {
    isLoading = true;
    if ($eth.signer || $eth.provider) {
      buyBackContract = new ethers.Contract(
        contracts.buyBackEdough,
        buyBackEdoughAbi,
        $eth.signer || $eth.provider,
      );

      rewardEscrowContract = new ethers.Contract(
        contracts.eDOUGH,
        rewardEscrowAbi,
        $eth.signer || $eth.provider,
      );
      await fetchBuyBack();
    }
    if ($eth.address) {
      initialized.onChainData = true;
    }

    initialized.onMount = true;
    isLoading = false;
  });

  async function fetchBuyBack() {
    console.log('eth on page', $eth);

    const pricePerDough = await buyBackContract.price();
    if ($eth.address) {
      try {
        const { total } = await rewardEscrowContract.getAvailableForBuyBack($eth.address);
        amount.label = toNum(total, 18);
        amount.bn = total;
        receivedAmount = await estimateBuyback(amount.bn);
      } catch (e) {
        console.error(e);
      }
    }
    const totalCanSell = await buyBackContract.maxAvailableToBuy();
    const tokenOut = await buyBackContract.tokenOut();
    const tokenContract = new ethers.Contract(tokenOut, erc20Abi, $eth.signer || $eth.provider);
    const usdcBalance = await tokenContract.balanceOf(contracts.buyBackEdough);
    poolUSDC = toNum(usdcBalance, 6);
    tokenPrice = toNumFixed(pricePerDough.value, 6);
    availableToBuy = toNum(totalCanSell, 18);
  }

  async function fetchOnchainData() {
    // Fetch balances, allowance and decimals
    listed = await fetchBalances(listed, $eth.address, $eth.provider, contracts.buyBackEdough);
    listed.forEach((token) => {
      allowances[token.address] = token.allowance;
    });

    listed.forEach((token) => {
      balances[token.address] = token.balance;
    });
  }

  async function estimateBuyback(amountIn) {
    if (!amountIn.gt(0)) return 0;
    const { quoteTokenOut } = await buyBackContract.getBuybackQuote(amountIn);
    return toNum(quoteTokenOut, 6);
  }

  async function swap() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    const signedEscrowContract = new ethers.Contract(
      contracts.eDOUGH,
      rewardEscrowAbi,
      $eth.signer,
    );

    const { emitter } = displayNotification(await signedEscrowContract.eDoughBuyback());

    emitter.on('txConfirmed', ({ hash }) => {
      const { dismiss } = displayNotification({
        message: 'Confirming...',
        type: 'pending',
      });

      const subscription = subject('blockNumber').subscribe({
        next: async () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${amount.label.toFixed(0)} ${sellToken.symbol} swapped successfully`,
            type: 'success',
          });
          await fetchOnchainData();
          await fetchBuyBack();
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

  async function burn() {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: 'hint' });
      connectWeb3();
      return;
    }

    const signedEscrowContract = new ethers.Contract(
      contracts.eDOUGH,
      rewardEscrowAbi,
      $eth.signer,
    );

    const { emitter } = displayNotification(await signedEscrowContract.eDoughBurn());

    emitter.on('txConfirmed', ({ hash }) => {
      const { dismiss } = displayNotification({
        message: 'Confirming...',
        type: 'pending',
      });

      const subscription = subject('blockNumber').subscribe({
        next: async () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${amount.label.toFixed(0)} ${sellToken.symbol} burned successfully`,
            type: 'success',
          });
          await fetchOnchainData();
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

<div class="relative content flex flex-col px-4">
  <div class="w-full py-20">
    <h1
      class="text-xl font-bold inline bg-gradient-to-r from-[#ed1ea0] via-[#6c5dfe] to-[#ed1ea0] bg-clip-text tracking-tight text-transparent leading-12"
    >
      eDOUGH Buyback
    </h1>
    <div class="mt-6 space-y-6 font-display text-sm tracking-tight">
      <p>
        The buyback program allows Dough holders to sell their Dough for USDC directly to the DAO at
        zero slippage. Buyback price (displayed below) will be equal to the 3day TWAP and will be
        updated every 4th day. Each epoch's buyback budget is streamed to the contract utilising
        llamapay.io and made available for buyback every 24 hours. Epochs last for two weeks. For
        more information regarding the program, <a
          class="text-pink"
          href="https://forum.piedao.org/t/dough-edough-buyback-program/1421/5"
          target="_blank"
          rel="noopener noreferrer">click here</a
        >. The interface below will display the current buyback price, the budget available at the
        moment and the resulting maximum Dough one can sell to the contract.
      </p>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-20">
      <div class="w-full rounded-xl flex cardbordergradient">
        <div class="px-6 py-4 flex flex-col">
          <div class="flex flex-col w-full">
            <span classy="text-base leading-6">Budget balance</span>
          </div>
          <div>
            <span class="font-thin text-lg mb-1 opacity-70"
              >{formatFiat(poolUSDC, ',', '.', '', 3)} USDC</span
            >
          </div>
        </div>
      </div>
      <div class="w-full rounded-xl flex cardbordergradient">
        <div class="px-6 py-4 flex flex-col">
          <div class="flex flex-col w-full">
            <span classy="text-base leading-6">Current Epoch's eDOUGH price</span>
          </div>
          <div>
            <span class="font-thin text-lg mb-1 opacity-70">{tokenPrice} USDC</span>
          </div>
        </div>
      </div>
      <div class="w-full rounded-xl flex cardbordergradient">
        <div class="px-6 py-4 flex flex-col">
          <div class="flex flex-col w-full">
            <span classy="text-base leading-6">Budget allowance</span>
          </div>
          <div>
            <span class="font-thin text-lg mb-1 opacity-70"
              >{formatFiat(availableToBuy, ',', '.', '')} eDOUGH</span
            >
          </div>
        </div>
      </div>
    </div>
    {#if $eth.address}
      <LightFarming />
    {/if}
    <div
      class="cardboardergradient bg-transparent flex flex-col items-center w-94pc md:w-50pc h-50pc mx-auto mt-20"
    >
      <div class="w-full py-8 px-12 md:px-20 flex flex-col items-center">
        <h2 class="text-xl font-bold text-center mb-4">Sell eDOUGH</h2>

        <div class="flex flex-col nowrap w-100pc swap-from p-16px">
          <div class="flex items-center justify-between">
            <div class="flex nowrap intems-center p-1 font-thin">From</div>
          </div>
          <div class="flex nowrap items-center p-1">
            <input
              class:error={balanceError}
              class="swap-input-from"
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
              disabled
            />
            <button class="swap-button-migration">
              <div class="flex items-center">
                <img
                  class="h-auto w-24px mr-5px"
                  alt={sellToken ? `${sellToken.symbol} logo` : ''}
                  src={sellToken ? sellToken.icon : ''}
                />
                <span class="sc-kXeGPI jeVIZw token-symbol-container"
                  >{sellToken ? sellToken.symbol : ''}</span
                >
              </div>
            </button>
          </div>
        </div>

        <div class="my-20px flex items-center">
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
              type="number"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0"
              minlength="1"
              maxlength="79"
              spellcheck="false"
            />
            <button class="swap-button-migration">
              <div class="flex items-center">
                <img
                  class="h-auto w-24px mr-5px"
                  alt={buyToken ? `${buyToken.symbol} logo` : ''}
                  src={buyToken ? buyToken.icon : ''}
                />
                <span class="sc-kXeGPI jeVIZw token-symbol-container"
                  >{buyToken ? buyToken.symbol : ''}</span
                >
              </div>
            </button>
          </div>
        </div>

        {#if error}
          <button disabled={true} class="stake-button error rounded-20px mt-10px p-15px w-100pc">
            {error}
          </button>
        {:else}
          <button
            class:error={error || isLoading}
            on:click={swap}
            disabled={error || isLoading || amount.label === 0 || !$eth.address}
            class="stake-button mt-10px rounded-20px p-15px w-100pc"
          >
            Sell
          </button>
        {/if}
      </div>
    </div>
    <div class="text-center my-4">
      <h2
        class="text-xl font-bold inline bg-gradient-to-r from-[#ed1ea0] via-[#6c5dfe] to-[#ed1ea0] bg-clip-text tracking-tight text-transparent leading-12 my-4"
      >
        OR
      </h2>
    </div>
    <div class="rainbow bg-transparent flex flex-col items-center w-94pc md:w-50pc h-50pc mx-auto">
      <h2 class="text-md font-medium text-left mb-4">
        Here you can burn your eDOUGH, what do you get out of it? Our most sincere gratitude to
        facilitate the process. Good Karma to you anon. The universe does not carry debts. It always
        returns back to you what you gave it.
      </h2>
      <div class="flex flex-col nowrap w-100pc swap-from p-16px">
        <div class="flex nowrap items-center p-1">
          <input
            class:error={balanceError}
            class="swap-input-from"
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
            disabled
          />
          <button class="swap-button-migration">
            <div class="flex items-center">
              <img
                class="h-auto w-24px mr-5px"
                alt={sellToken ? `${sellToken.symbol} logo` : ''}
                src={sellToken ? sellToken.icon : ''}
              />
              <span class="sc-kXeGPI jeVIZw token-symbol-container"
                >{sellToken ? sellToken.symbol : ''}</span
              >
            </div>
          </button>
        </div>
      </div>
      <button
        on:click={burn}
        disabled={amount.label === '' || amount.label === 0 || !$eth.address}
        class="stake-button rounded-20px p-15px w-100pc mt-auto"
      >
        Burn your eDOUGH
      </button>
    </div>
  </div>
</div>
