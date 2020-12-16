<script>
  import { onMount } from "svelte";
  import BigNumber from "bignumber.js";

  import debounce from "lodash/debounce";

  import { _ } from "svelte-i18n";
  import { ethers } from "ethers";
  import { pieSmartPool, erc20 } from "@pie-dao/abis";

  import images from "../../config/images.json";
  import poolsConfig from "../../config/pools.json";
  import recipeAbi from '../../config/recipeABI.json';

  import displayNotification from "../../notifications.js";
  import TokenSelectModal from "./TokenSelectModal.svelte";

  import {
    allowances,
    approveMax,
    functionKey,
    balanceKey,
    balances,
    connectWeb3,
    contract,
    eth,
    pools,
    bumpLifecycle,
    subject,
  } from "../../stores/eth.js";
  import {
    amountFormatter,
    fetchCalcTokensForAmounts,
    fetchPieTokens,
    fetchPooledTokens,
    maxAmount,
    getTokenImage,
    fetchEthBalance,
    fetchCalcToPie,
  } from "../helpers.js";

  window.B = BigNumber;

  export let token;
  export let poolAction;
  export let method; // NOTE: This really should be named poolAddress. Token is too generic.;

  let tokenSelectModalOpen = false;
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (token) {
      window.location.hash = `#/pools/${token.address}`;
      fetchQuote(null, token.address);
    }
  };

  let amount = "1.00000000";
  let approach = poolAction;
  let areTokensEnoughBool = true;
  let withdrawDisabled = false;
  let ethKey;
  let ethBalance = 0;
  let ethNeededSingleEntry = { val: 0, label:'-'};
  let amountsRequired = {};
  let isLoading;

  $: pieTokens = fetchPieTokens($balances);

  $: tokenSymbol = (poolsConfig[token] || {}).symbol;
  $: tokenLogo = images.logos[token];
  $: type = poolsConfig[token].useRecipe === true ? method : 'multi';

  $: pooledTokens = fetchPooledTokens(token, amount, $pools[token], $allowances, $balances);
  $: lockedPoolTokens = pooledTokens.filter(({ actionBtnLabel }) => actionBtnLabel === "Unlock");

  $: if($eth.address) {
    fetchEthBalance($eth.address);
    ethKey = balanceKey(ethers.constants.AddressZero, $eth.address);
  }

  $: ethBalance = BigNumber($balances[ethKey]).toString();

  const fetchQuote = async (event, pieAddress=null) => {
    ethNeededSingleEntry.label = '-';
    try {
      isLoading = true;
      const pieToMint = pieAddress || token;
      ethNeededSingleEntry = (await fetchCalcToPie(pieToMint, amount));
      isLoading = false;
    } catch (e) { console.error(e)}
  }

  const fetchAmounts = async (event, pieAddress=null) => {
    try {
      isLoading = true;  
      const pieToMint = pieAddress || token;
      amountsRequired = (await fetchCalcTokensForAmounts(pieToMint, amount));
      isLoading = false;

      if(approach === 'add')
        areTokensEnough();
      else {
        enoughPieToRedeem();
      }
    } catch (e) { console.error(e)}
  }

  onMount(async () => {
    fetchQuote();
    fetchAmounts();
  });

  const action = async (evt, pooledToken) => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    const { address } = pooledToken;

    if (pooledToken.actionBtnLabel === "Unlock") {
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
      const message = `Not enough ETH`;
      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    const recipe = await contract({ address: '0x6cb4b8669e23295563d3b34df4a760c0cee993c7', abi: recipeAbi });
    const amountWei = requestedAmount.multipliedBy(10 ** 18).toFixed(0);

    let overrides = {
      value: percentagePlus,
      gasLimit: 3000000
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

  const areTokensEnough = () => {
      if(!$eth.address || $eth.address === '') {
        return;
      }
      let errors = [];
      Object.keys(amountsRequired).forEach( token => {
        let key = balanceKey(token, $eth.address);
        let max = $balances[key];

        if(BigNumber(amountsRequired[token].label).isGreaterThan(BigNumber(max.toString()))) {
          errors.push(token);
        }
      });

      if( errors.length > 0) {
        console.log('Missing tokens', errors);
        areTokensEnoughBool = false;
        return false;
      }

      areTokensEnoughBool = true;
      return true;
  };

  const askApproval = async (address, spender) => {
    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    let erc20Contract = new ethers.Contract(address, erc20, $eth.signer);
    console.log('Im being calle');

    const { hash } = await erc20Contract['approve(address,uint256)'](spender, ethers.constants.MaxUint256);
    const { emitter } = displayNotification({ hash });
    const symbol = await erc20Contract.symbol();
    
    await new Promise((resolve) => emitter.on('txConfirmed', ({ blockNumber }) => {
      currentBlockNumber = blockNumber;
      resolve();
      return { message: `${symbol} unlocked`, type: 'success' };
    }));
  }

  const mint = async () => {
    const requestedAmount = BigNumber(amount);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    if(!areTokensEnough()) {
      displayNotification({ message: 'Looks like you are missing some tokens!', type: "error", autoDismiss: 30000 });
      return;
    }
    
    for (let i = 0; i < pooledTokens.length; i += 1) {
      let allowanceKey = functionKey(pooledTokens[i].address, 'allowance', [$eth.address, token]);
      let allowance = $allowances[allowanceKey];
      console.log(`Allowance ${pooledTokens[i].symbol}: ${allowance}`);
      if( new BigNumber(allowance).isLessThan(requestedAmount) ) {
        console.log('Im asking for allowance')
        askApproval(pooledTokens[i].address, token);
      }
    }

    console.log('Allowance done');

    try {
      const tokenContract = await contract({ abi: pieSmartPool, address: token });
      const decimals = await tokenContract.decimals();
      const arg = requestedAmount.multipliedBy(10 ** decimals).toFixed(0);
      const { emitter } = displayNotification(await tokenContract.joinPool(arg));

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
    } catch (e) {
      displayNotification({ message: e.message, type: "error", autoDismiss: 30000 });
    }
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

  const enoughPieToRedeem = () => {
    if(!$eth.address || $eth.address === '') {
      withdrawDisabled = true;
      return;
    }
    const key = balanceKey(token, $eth.address);
    let max = $balances[key];
    withdrawDisabled = BigNumber(amount).isGreaterThan(max);
  };

  const setValuePercentage = percent => {
    let max = maxAmount(token, pooledTokens);
    if (approach === 'withdraw') {
      const key = balanceKey(token, $eth.address);
      max = $balances[key];
    }
    const adjusted = max.multipliedBy(BigNumber(percent).dividedBy(100));
    amount = adjusted.toFixed(8, BigNumber.ROUND_DOWN);
    fetchAmounts();
  };

  const withdraw = async () => {
    const requestedAmount = BigNumber(amount);
    const key = balanceKey(token, $eth.address);
    const max = $balances[key];

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_('piedao.please.connect.wallet'), type: "hint" });
      connectWeb3();
      return;
    }

    if (requestedAmount.isGreaterThan(max)) {
      const maxFormatted = amountFormatter({ amount: max, displayDecimals: 8 });

      const message = `${$_('piedao.max.withdraw.notice')} ${maxFormatted} ${tokenSymbol}.`;

      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    const tokenContract = await contract({ abi: pieSmartPool, address: token });
    const decimals = await tokenContract.decimals();
    const arg = requestedAmount.multipliedBy(10 ** decimals).toFixed(0);
    const { emitter } = displayNotification(await tokenContract.exitPool(arg));

    emitter.on("txConfirmed", ({ hash }) => {
      const { dismiss } = displayNotification({
        message: $_("piedao.confirming"),
        type: "pending"
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ${tokenSymbol} `
              + `${$_('general.successfully').toLowerCase()} ${$_('general.withdrawn').toLowerCase()}`,
            type: "success"
          });
          dismiss();
          subscription.unsubscribe();
        }
      });

      return {
        autoDismiss: 1,
        message: $_('general.mined'),
        type: "success"
      };
    });
  };
</script>


<div class="liquidity-container bg-grey-243 rounded-4px p-4 w-100pc md:p-6 ">

    {#if approach === 'add'}
    <div class="row flex font-thin">
      <div class="flex-auto text-right">{$_('general.single')} {$_('general.asset')}</div>
      <div class="switch mx-4" on:click={() => {
        if(!poolsConfig[token].useRecipe) {
          alert($_('piedao.single.asset.coming.soon'));
          return
        }

        if(type === 'single'){
          type = 'multi';
        } else {
          type = 'single';
          approach = 'add';
        }
      }}>
        <input type="checkbox" class="toggle-input" checked={type === 'multi'} />
        <span class="toggle active border-grey" />
      </div>
      <div class="flex-auto text-left">{$_('general.multi')} {$_('general.asset')}</div>
    </div>
    {/if}

    <p class="text-center font-thin my-4 mx-2">

    {#if type === 'single'}
      <div class="text-left md:my-16px md:mx-20px">
        Using Single asset Entry, you can use ETH to mint a Pie in one transaction.
        <br> Single Asset Entry fetches the underlying assets for you from external markets like Uniswap, because of that slippage might apply.
        <strong>5% more ETH</strong> are sent during the TX to avoid unxpected errors, any unused ETH is returned.
      </div>
    {/if}

    {#if type === 'multi'}
      {#if approach === 'add'}
        {$_('piedao.multi.asset.enables.minting')} 
      {:else}
        {$_('piedao.multi.asset.enables.withdraw')} 
      {/if}

      {tokenSymbol}

      {#if approach === 'add'}
        {$_('piedao.multi.asset.according.to.allocation')}
      {:else}
        {$_('piedao.multi.asset.all.underlying')}
      {/if}
    {/if}
      
    </p>

    {#if type === 'multi'}
      <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
        <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
          <div class="left float-left">{$_('general.amount')}</div>
          {#if approach === "withdraw"}
          <div
            class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
            <div
              class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer"
              on:click={() => setValuePercentage(25)}>
              25%
            </div>
            <div
              class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer"
              on:click={() => setValuePercentage(50)}>
              50%
            </div>
            <div
              class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer"
              on:click={() => setValuePercentage(75)}>
              75%
            </div>
            <div
              class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer"
              on:click={() => setValuePercentage(100)}>
              100%
            </div>
          </div>
          {/if}
        </div>
        <div class="bottom  px-4 py-4 md:px-4 pb-4">
          <input type="number" on:keyup="{ debounce(fetchAmounts, 250)}" bind:value={amount} class="font-thin text-base w-60pc md:w-75pc md:text-xl" />
          <div
            class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
            align-middle justify-center items-center pointer mt-0 md:mt-14px"
            on:click={() => (tokenSelectModalOpen = true)}>
            <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src={tokenLogo} alt={tokenSymbol} />
            <span class="py-2px px-4px">{tokenSymbol}</span>
          </div>
          <TokenSelectModal
            tokens={pieTokens}
            open={tokenSelectModalOpen}
            callback={tokenSelectCallback} />
        </div>
      </div>
    {/if}

    {#if type === 'single'}
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
            tokens={pieTokens}
            open={tokenSelectModalOpen}
            callback={tokenSelectCallback} />
        </div>
      </div>
    {/if}
    

    {#if isLoading === true}
      <div class="h-12px mx-50pc my-16px">
          <div class="loadingio-spinner-wedges-meab1ddaeuq"><div class="ldio-qudhur211ps">
          <div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>
          </div></div>
      </div>
    {/if}
    {#if type === 'multi' && isLoading != true}
      <img src={images.icons.downArrow} class="h-12px mx-50pc my-16px" alt="down arrow icon" />
    {/if}

    {#if type === 'single'}
      <div class="my-16px mx-20px">
      Using this much ETH
      </div>
    {/if}


    {#if type === 'single'}
    <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
      <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
        <div class="left float-left">{$_('general.amount')}</div>
      </div>
      <div class="bottom px-4 py-4 md:py-2">
        <input type="text" disabled value={ethNeededSingleEntry.label} class="font-thin text-base w-60pc md:w-75pc md:text-xl" />
        <div
          class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer mt-0 md:mt-14px">
          <img class="token-icon w-26px h-26px my-4px mx-2px" src={getTokenImage('eth')} alt="ETH" />
          <span class="py-2px px-4px">ETH</span>
        </div>
      </div>
    </div>
    {/if}

    {#if type === 'multi'}
      {#each pooledTokens as pooledToken}
        <div class="token-summary overflow-x-scroll bg-white rounded-8px mx-0 md:mx-4 my-4px flex flex-start items-center">
            <div class="min-w-22pc p-12px text-sm md:text-lg" style={`color: ${pooledToken.color}`}>
              {amountFormatter({
                amount: pooledToken.originalWeight,
                approximatePrefix: '',
                displayDecimals: 2,
                rounding: 4,
              })}%
            </div>
            <img
              class="token-icon my-8px w-26px h-26px"
              src={getTokenImage(pooledToken.address)}
              alt={pooledToken.symbol} />
            <div
              class="token-symbol min-w-15pc md:min-w-10pc px-6px py-12px text-sm font-thin border-r-2 border-r-solid border-grey-243 align-middle md:leading-8">
              {pooledToken.symbol}
            </div>
          {#if approach === "add"}
            <div class="amount tex-sm px-20px py-12px w-150px">
              {(amountsRequired[pooledToken.address.toLowerCase()] ? amountsRequired[pooledToken.address.toLowerCase()].label : '-' )}
            </div>
          {:else}
            <div class="amount tex-sm px-20px py-12px m-auto">
            {(amountsRequired[pooledToken.address.toLowerCase()] ? amountsRequired[pooledToken.address.toLowerCase()].label : '-' )}
            </div>
          {/if}
          <div class="hidden">{$eth.address}</div>
        </div>
      {/each}
    {/if}
    

    <center>
      {#if approach === 'add'}
        <button disabled={!areTokensEnoughBool && type === 'multi'} class="btn m-0 mt-4 rounded-8px px-56px py-15px" on:click={() => primaryAction()}>
            {$_('general.add')} {$_('general.liquidity')}
        </button>
      {:else}
        <button disabled={withdrawDisabled} class="btn m-0 mt-4 rounded-8px px-56px py-15px" on:click={() => primaryAction()}>
            {$_('general.withdraw')}
        </button>
      {/if}
    </center>
  </div>