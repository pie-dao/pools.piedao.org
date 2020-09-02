<script>
  import BigNumber from "bignumber.js";

  import { _ } from "svelte-i18n";
  import { ethers } from "ethers";
  import { pieSmartPool } from "@pie-dao/abis";

  import images from "../config/images.json";
  import poolsConfig from "../config/pools.json";

  import displayNotification from "../notifications.js";
  import TokenSelectModal from "./TokenSelectModal.svelte";

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
    fetchPieTokens,
    fetchPooledTokens,
    maxAmount,
    getTokenImage,
  } from "./helpers.js";

  export let token; // NOTE: This really should be named poolAddress. Token is too generic.
  let type = "single";

  let tokenSelectModalOpen = false;
  const tokenSelectCallback = (token) => {
    tokenSelectModalOpen = false;
    if (token) {
      window.location.hash = `#/pools/${token.address}`;
    }
  };

  // let balanceClass = 'blur-heavy';
  // let yourBalanceClass = 'blur-light';

  let amount = "1.00000000";
  let approach = "add";

  $: pieTokens = fetchPieTokens($balances);

  $: tokenSymbol = (poolsConfig[token] || {}).symbol;
  $: tokenLogo = images.logos[token];

  $: pooledTokens = fetchPooledTokens(token, amount, $pools[token], $allowances, $balances);
  $: lockedPoolTokens = pooledTokens.filter(({ actionBtnLabel }) => actionBtnLabel === "Unlock");

  const action = async (evt, pooledToken) => {
    const { address } = pooledToken;

    if (pooledToken.actionBtnLabel === "Unlock") {
      evt.preventDefault();
      await approveMax(address, token);
    } else if (pooledToken.actionBtnLabel === "ready") {
      evt.preventDefault();
    }
  };

  const mint = async () => {
    const requestedAmount = BigNumber(amount);
    const max = maxAmount(token, pooledTokens, 1);

    if (!$eth.address || !$eth.signer) {
      displayNotification({ message: $_("piedao.please.connect.wallet"), type: "hint" });
      connectWeb3();
      return;
    }

    if (requestedAmount.isGreaterThan(max)) {
      const needMore = pooledTokens
        .filter(({ actionBtnLabel }) => actionBtnLabel === "BUY")
        .map(({ symbol }) => symbol)
        .join(", ");

      const maxFormatted = amountFormatter({ amount: max, displayDecimals: 8 });

      const message =
        `${$_("piedao.max.mint.notice")} ${maxFormatted} ${tokenSymbol}. ` +
        `${$_("piedao.more.tokens.notice")}: ${needMore}`;

      displayNotification({ message, type: "error", autoDismiss: 30000 });
      return;
    }

    for (let i = 0; i < lockedPoolTokens.length; i += 1) {
      approveMax(lockedPoolTokens[i].address, token);
    }

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
  };

  const primaryAction = () => {
    if (approach === "add") {
      mint();
    } else {
      withdraw();
    }
  }

  const setValuePercentage = percent => {
    let max = maxAmount(token, pooledTokens);
    if (approach === 'withdraw') {
      const key = balanceKey(token, $eth.address);
      max = $balances[key];
    }
    const adjusted = max.multipliedBy(BigNumber(percent).dividedBy(100));
    amount = adjusted.toFixed(8, BigNumber.ROUND_DOWN);
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

<div class="liquidity-container bg-grey-243 w-100pc rounded-4px p-6">
  <h1 class="text-center text-xl">
    {#if approach === 'add'}
      {$_('general.add')} {$_('general.liquidity')}
    {:else}
      {$_('general.withdraw')}
    {/if}
  </h1>

  <div class="row flex font-thin">
    <div class="flex-auto text-right">{$_('general.single')} {$_('general.asset')}</div>
    <div class="switch mx-4" on:click={() => alert(_('piedao.single.asset.coming.soon'))}>
      <input type="checkbox" class="toggle-input" checked={type === 'multi'} />
      <span class="toggle active border-grey" />
    </div>
    <div class="flex-auto text-left">{$_('general.multi')} {$_('general.asset')}</div>
  </div>

  <p class="text-center m-4">
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
  </p>

  {#if type === 'multi'}
    <div class="row bg-white border border-solid rounded-8px border-grey-204 mx-4 flex mb-32px font-thin pointer">
      <div class="toggle-btn bg-grey-243 p-20px w-50pc text-center {approach === 'add' ? 'active' : ''}" on:click={() => approach = "add"}>{$_('general.add')} {$_('general.liquidity')}</div>
      <div class="toggle-btn bg-grey-243 text-center p-20px w-50pc {approach === 'withdraw' ? 'active' : ''}" on:click={() => approach = "withdraw"}>{$_('general.withdraw')}</div>
    </div>
  {/if}

  {#if type === 'multi'}
    <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-4">
      <div class="top h-32px text-sm font-thin px-4 py-2">
        <div class="left float-left">{$_('general.amount')}</div>
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
      </div>
      <div class="bottom px-4 pb-2">
        <input type="number" bind:value={amount} class="text-xl w-75pc font-thin" />
        <div
          class="asset-btn float-right mt-14px h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer"
          on:click={() => (tokenSelectModalOpen = true)}>
          <img class="token-icon w-26px h-26px my-4px mx-2px" src={tokenLogo} alt={tokenSymbol} />
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
  <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-4">
    <div class="top h-32px text-sm font-thin px-4 py-2">
      <div class="left float-left">{$_('general.amount')}</div>
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
    </div>
    <div class="bottom px-4 pb-2">
      <input type="number" bind:value={amount} class="text-xl w-75pc font-thin" />
      <div
        class="asset-btn float-right mt-14px h-32px bg-grey-243 rounded-32px px-2px flex
        align-middle justify-center items-center pointer">
        <img class="token-icon w-26px h-26px my-4px mx-2px" src={getTokenImage('eth')} alt="ETH" />
        <span class="py-2px px-4px">ETH</span>
      </div>
    </div>
  </div>
  {/if}

  <img src={images.icons.downArrow} class="h-12px mx-50pc my-16px" alt="down arrow icon" />

  {#if type === 'multi'}
    {#each pooledTokens as pooledToken}
      <div class="token-summary bg-white rounded-8px mx-4 my-4px flex">
        <div class="p-12px text-sm w-75px" style={`color: ${pooledToken.color}`}>
          {amountFormatter({
            amount: pooledToken.percentage,
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
          class="token-symbol px-6px py-12px text-sm font-thin border-r-2 border-r-solid
          border-grey-243 w-60px">
          {pooledToken.symbol}
        </div>
        {#if approach === "add"}
          <div class="amount tex-sm px-20px py-12px w-150px">{pooledToken.amountRequired}</div>
          <div class={`${pooledToken.amountVsBalanceClass} font-thin text-xs mt-14px w-150px`}>
            Bal - {pooledToken.amountVsBalance}
          </div>
          <a
            class={pooledToken.actionBtnClass}
            href={pooledToken.buyLink}
            on:click={evt => action(evt, pooledToken)}
            target="_blank">
            {pooledToken.actionBtnLabel}
          </a>
        {:else}
          <div class="amount tex-sm px-20px py-12px m-auto">{pooledToken.amountRequired}</div>
        {/if}
        <div class="hidden">{$eth.address}</div>
      </div>
    {/each}
  {/if}
  {#if type === 'single'}
    <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-4">
      <div class="top h-32px text-sm font-thin px-4 py-2">
        <div class="left float-left">{$_('general.amount')}</div>
        <div class="right font-bold text-xs py-1px text-center align-right float-right rounded">
          ⚠️ slippage might apply
        </div>
      </div>
      <div class="bottom px-4 pb-2">
        <input type="number" bind:value={amount} class="text-xl w-75pc font-thin" />
        <div
          class="asset-btn float-right mt-14px h-32px bg-grey-243 rounded-32px px-2px flex
          align-middle justify-center items-center pointer"
          on:click={() => (tokenSelectModalOpen = true)}>
          <img class="token-icon w-26px h-26px my-4px mx-2px" src={tokenLogo} alt={tokenSymbol} />
          <span class="py-2px px-4px">{tokenSymbol}</span>
        </div>
        <TokenSelectModal
          tokens={pieTokens}
          open={tokenSelectModalOpen}
          callback={tokenSelectCallback} />
      </div>
    </div>
  {/if}

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
