<script>
  import { onMount } from "svelte";
  import BigNumber from "bignumber.js";

  import debounce from "lodash/debounce";

  import { _ } from "svelte-i18n";
  import { ethers } from "ethers";
  import { pieSmartPool } from "@pie-dao/abis";
  import { get } from 'svelte/store';
  import smartcontracts from '../config/smartcontracts.json';
  import images from "../config/images.json";
  import poolsConfig from "../config/pools.json";
  import uniswapLpZapABI from '../config/uniswapLpZapABI.json';

  import displayNotification from "../notifications.js";
  import TokenSelectModal from "./modals/TokenSelectModal.svelte";

  import {
    allowances,
    approveMax,
    balanceKey,
    balances,
    connectWeb3,
    contract,
    eth,
    pools,
    bumpLifecycle,
    subject,
  } from "../stores/eth.js";
  import {
    amountFormatter,
    fetchCalcTokensForAmounts,
    fetchPieTokens,
    fetchPooledTokens,
    maxAmount,
    getTokenImage,
    fetchEthBalance,
    fetchCalcToPie,
  } from "./helpers.js";

  window.B = BigNumber;

  //export let token;
  export let poolAction;
  export let method; // NOTE: This really should be named poolAddress. Token is too generic.;

  let tokenSelectModalOpen = false;
  let tokenSelectModalOpen2 = false;
  const tokenSelectCallback = (_token) => {
    tokenSelectModalOpen = false;

    if (_token) {
      token = _token;
      setTimeout(fetchQuote, 1000);
    }
  };

  const tokenSelectCallback2 = (_token) => {
    tokenSelectModalOpen2 = false;
    if (_token) {
      
      tokenOut = _token;
      setTimeout(fetchQuote, 1000);
    }
  };

  let amount = "1.00000000";
  let approach = 'add';
  let ethKey;
  let ethBalance = 0;
  let ethNeededSingleEntry = { val: 0, label:'-'};
  let amountsRequired = {};
  let isLoading;


  const tokensSwapIn = [
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      balance: '0',
      icon: getTokenImage('eth')
    },
    {
      symbol: "SNX",
      address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
      balance: '0',
      icon: getTokenImage('0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F')
    },
    {
      symbol: "UMA",
      address: "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
      balance: '0',
      icon: getTokenImage('0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828')
    },
  ];

  const tokensSwapOut = [
    {
      symbol: "USDC/ETH",
      address: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
      balance: '0',
      type: 'UniswapV2',
      containing: [
        {
          symbol: "USDC",
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          balance: '0',
          icon: getTokenImage('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
        },
        {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          balance: '0',
          icon: getTokenImage('eth')
        },
      ]
    },
    {
      symbol: "DEFI+S/DAI",
      address: "0x7aefaf3ea1b465dd01561b0548c9fd969e3f76ba",
      type: 'UniswapV2',
      balance: '0',
      containing: [
        {
          symbol: "DEFI+S",
          address: "0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C",
          balance: '0',
          icon: getTokenImage('0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C')
        },
        {
          symbol: "DAI",
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
          balance: '0',
          icon: getTokenImage('0x6b175474e89094c44da98b954eedeac495271d0f')
        },
      ]
    },
  ];

  const pieTokens = [];

  $: token = tokensSwapIn[0] || {};
  $: tokenSymbol = (token || {}).symbol;
  $: tokenLogo = (token || {}).icon;

  $: tokenOut = tokensSwapOut[1] || {};

  $: type = 'single';

  $: if($eth.address) {
    fetchEthBalance($eth.address);
    ethKey = balanceKey(ethers.constants.AddressZero, $eth.address);
  }

  $: ethBalance = BigNumber($balances[ethKey]).toString();

  const fetchQuote = async (event, pieAddress=null) => {
    ethNeededSingleEntry.label = '-';
    console.log('tokensSwapIn', tokensSwapIn);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    try {
      const { provider, signer } = get(eth);
      let contract = new ethers.Contract('0x80c5e6908368cb9db503ba968d7ec5a565bfb389', uniswapLpZapABI, provider);
      const requestedAmount = BigNumber(amount);

      console.log(`Swapping ${token.symbol} for ${tokenOut.symbol} containing ${tokenOut.containing[0].symbol}/${tokenOut.containing[1].symbol}`)
      const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

      let overrides = {
        value: token.address === tokensSwapIn[0].address ? amountWei : '0'
      }

      let data = await contract.callStatic.ZapIn(
        $eth.address, //_toWhomToIssue
        token.address, //_FromTokenContractAddress 
        tokenOut.containing[0].address, //_ToUnipoolToken0
        tokenOut.containing[1].address, //_ToUnipoolToken1
        amountWei, //amount
        '0',
        overrides
      );

      console.log('data', data.toString());

      ethNeededSingleEntry = {
        val: data,
        label: ethers.utils.formatEther(data),
      };

    } catch (e) { 
      console.log(e)
      if(e.reason ==="SafeERC20: low-level call failed") {
        displayNotification({ message: 'Please Approve to check the LP amount estimantion.', type: "error", autoDismiss: 30000 });
      } else {
        displayNotification({ message: e.code, type: "error", autoDismiss: 30000 });
      }
    }
  }

  onMount(async () => {
  });

  const action = async (evt, pooledToken) => {
    const { address } = pooledToken;

    if (pooledToken.actionBtnLabel === "Unlock") {
      evt.preventDefault();
      await approveMax(address, token);
    } else if (pooledToken.actionBtnLabel === "ready") {
      evt.preventDefault();
    }
  };

  const mintFromRecipe = async () => {
    const requestedAmount = BigNumber(amount);
    const max = BigNumber(ethBalance).multipliedBy(10 ** 18).toFixed(0);

    await fetchQuote();

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const percentagePlus = BigNumber(ethNeededSingleEntry.val.toString()).multipliedBy(BigNumber(1.05)).toFixed(0);


    if (BigNumber(percentagePlus).isGreaterThan(BigNumber(max)) ) {
      const maxFormatted = amountFormatter({ amount: max, displayDecimals: 8 });
      //TODO i18n
      const message = `Not enough ETH`;
      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    const recipe = await contract({ address: smartcontracts.recipe, abi: recipeAbi });
    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    let overrides = {
      value: percentagePlus
    }

    console.log({
      pie: token,
      amountWei,
      value: ethNeededSingleEntry.val
    })

    const { emitter } = displayNotification(await recipe.toPie(token, amountWei, overrides) );

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: "Confirming...",
        type: "pending",
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ${tokenSymbol} successfully minted`,
            type: "success",
          });
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
  };

  const primaryAction = () => {
    if(type === 'single') {
      mintFromRecipe();
      return;
    }
    
    if (approach === "add") {
      mint();
    } else {
      withdraw();
    }
  }

</script>

<div class="liquidity-container bg-grey-243 rounded-4px p-4 md:p-6 w-full">
  <h1 class="text-center text-xl">
    {#if approach === 'add'}
      {$_('general.add')} {$_('general.liquidity')}
    {:else}
      {$_('general.withdraw')}
    {/if}
  </h1>


  <p class="text-center font-thin my-4 mx-2">
    <div class="text-left md:my-16px md:mx-20px">
      Use ZapIn
    </div>
    
    <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
      <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
        <div class="left float-left">{$_('general.amount')}</div>
        <div class="right font-bold text-xs py-1px text-center align-right float-right rounded">
          ⚠️ slippage might apply
        </div>
      </div>
      <div class="bottom px-4 py-4 md:py-2">
        <input type="number" on:keyup="{ debounce(fetchQuote, 250)}" bind:value={amount} class="font-thin text-base w-60pc md:w-75pc md:text-xl" />
        <div
          class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px"
          on:click={() => (tokenSelectModalOpen = true)}>
          <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src={tokenLogo} alt={tokenSymbol} />
          <span class="py-2px px-4px">{tokenSymbol}</span>
        </div>
        <TokenSelectModal
          tokens={tokensSwapIn}
          open={tokenSelectModalOpen}
          callback={tokenSelectCallback} />
      </div>
    </div>


  {#if isLoading === true}
    <div class="h-12px mx-50pc my-16px">
        <div class="loadingio-spinner-wedges-meab1ddaeuq"><div class="ldio-qudhur211ps">
        <div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>
        </div></div>
    </div>
  {/if}

  <div class="my-16px mx-20px">
    {#if tokenOut.type === 'UniswapV2'}
      Inside 🦄 Uniswap V2 Pool: {tokenOut.symbol}
    {/if}
  </div>

  <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
    <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
      <div class="left float-left">Approx. LP tokens</div>
    </div>
    <div class="bottom px-4 py-4 md:py-2">
        <input type="text" disabled value={ethNeededSingleEntry.label} class="font-thin text-base w-60pc md:w-75pc md:text-xl" />
        <div
          class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px"
          on:click={() => (tokenSelectModalOpen2 = true)}>
          <span class="py-2px px-4px">{tokenOut.symbol}</span>
        </div>
        <TokenSelectModal
          tokens={tokensSwapOut}
          open={tokenSelectModalOpen2}
          callback={tokenSelectCallback2} />
    </div>
    
  </div>

  <center>
    <button class="btn m-0 mt-4 rounded-8px px-56px py-15px" on:click={() => primaryAction()}>
      {#if approach === 'add'}
        {$_('general.add')} {$_('general.liquidity')}
      {:else}
        {$_('general.withdraw')}
      {/if}
    </button>
  </center>
</div>
