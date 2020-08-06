<script>
  import BigNumber from "bignumber.js";

  import { _ } from "svelte-i18n";
  import { ethers } from "ethers";
  import { pieSmartPool } from "@pie-dao/abis";

  import images from "../config/images.json";
  import poolsConfig from "../config/pools.json";

  import {
    allowances,
    approveMax,
    balances,
    connectWeb3,
    contract,
    eth,
    pools,
    bumpLifecycle,
    subject
  } from "../stores/eth.js";
  import { amountFormatter, fetchPooledTokens, maxAmount, getTokenImage } from "./helpers.js";
  import { displayNotification } from "../notifications.js";

  export let token; // NOTE: This really should be named poolAddress. Token is too generic.
  let type = "multi";

  // let balanceClass = 'blur-heavy';
  // let yourBalanceClass = 'blur-light';

  let amount = "1.00000000";

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
      displayNotification({ message: "Please connect a wallet and try again.", type: "hint" });
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
        `At the moment you only have enough funds to mint ${maxFormatted} ${tokenSymbol}. ` +
        `To proceed you will need more of these tokens: ${needMore}`;

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
        type: "pending"
      });

      const subscription = subject("blockNumber").subscribe({
        next: () => {
          displayNotification({
            autoDismiss: 15000,
            message: `${requestedAmount.toFixed()} ${tokenSymbol} successfully minted`,
            type: "success"
          });
          dismiss();
          subscription.unsubscribe();
        }
      });

      return {
        autoDismiss: 1,
        message: "Mined",
        type: "success"
      };
    });
  };

  const setValuePercentage = percent => {
    const max = maxAmount(token, pooledTokens);
    const adjusted = max.multipliedBy(BigNumber(percent).dividedBy(100));
    amount = adjusted.toFixed(8, BigNumber.ROUND_DOWN);
  };
</script>

<div class="liquidity-container bg-grey-243 w-100pc rounded-4px p-6">
  <h1 class="text-center text-xl">{$_('general.add')} {$_('general.liquidity')}</h1>
  <div class="row flex font-thin">
    <div class="flex-auto text-right">{$_('general.single')} {$_('general.asset')}</div>
    <div class="switch mx-4" on:click={() => alert('Single Asset entry coming soon!')}>
      <input type="checkbox" class="toggle-input" checked={type === 'multi'} />
      <span class="toggle active border-grey" />
    </div>
    <div class="flex-auto text-left">{$_('general.multi')} {$_('general.asset')}</div>
  </div>

  <p class="text-center m-4">
    {$_('piedao.multi.asset.enables.minting')} {tokenSymbol}
    {$_('piedao.multi.asset.according.to.allocation')}
  </p>

  <!--
  <div class="row">
    <div class="toggle-btn active">{$_('general.add')} {$_('general.liquidity')}</div>
    <div class="toggle-btn">{$_('general.withdraw')}</div>
  </div>
  -->

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
      <input type="number" bind:value={amount} class="text-xl font-thin" />
      <div
        class="asset-btn float-right mt-14px h-32px bg-grey-243 rounded-32px px-2px flex
        align-middle justify-center items-center">
        <img class="token-icon w-26px h-26px my-4px mx-2px" src={tokenLogo} alt={tokenSymbol} />
        <span class="py-2px px-4px">{tokenSymbol}</span>
      </div>
    </div>
  </div>

  <img src={images.icons.downArrow} class="h-12px mx-50pc my-16px" alt="down arrow icon" />

  {#each pooledTokens as pooledToken}
    <div class="token-summary bg-white rounded-8px mx-4 my-4px flex">
      <div class="p-12px text-sm w-75px" style={`color: ${pooledToken.color}`}>
        {amountFormatter({
          amount: pooledToken.percentage,
          approximatePrefix: '',
          displayDecimals: 2,
          rounding: 4
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
      <div class="hidden">{$eth.address}</div>
    </div>
  {/each}

  <center>
    <button class="btn m-0 mt-4 rounded-8px px-56px py-15px" on:click={() => mint()}>
      {$_('general.add')} {$_('general.liquidity')}
    </button>
  </center>
</div>
