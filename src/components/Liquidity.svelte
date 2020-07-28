<script>
  import BigNumber from "bignumber.js";

  import { _ } from "svelte-i18n";
  import { ethers } from "ethers";

  import images from "../config/images.json";
  import poolsConfig from "../config/pools.json";

  import { allowances, balances, contract, eth, pools } from "../stores/eth.js";
  import { amountFormatter, fetchPooledTokens, maxAmount } from "./helpers.js";

  export let token; // NOTE: This really should be named poolAddress. Token is too generic.
  let type = "multi";

  // let balanceClass = 'blur-heavy';
  // let yourBalanceClass = 'blur-light';

  let amount = "1.00000000";

  $: tokenSymbol = (poolsConfig[token] || {}).symbol;
  $: tokenLogo = images.logos[tokenSymbol];

  $: pooledTokens = (() => {
    console.log("generating pooledTokens", Date.now());
    return fetchPooledTokens(token, amount, $pools[token], $allowances, $balances);
  })();

  const action = async (evt, pooledToken) => {
    const { address } = pooledToken;

    if (pooledToken.actionBtnLabel === "Unlock") {
      evt.preventDefault();
      (await contract({ address })).approve(token, ethers.constants.MaxUint256);
    } else if (pooledToken.actionBtnLabel === "ready") {
      evt.preventDefault();
    }
  };

  const mint = () => {
    const requestedAmount = BigNumber(amount);
    const max = maxAmount(token, pooledTokens);

    if (requestedAmount.isGreaterThan(max)) {
      return;
    }
  };

  const setValuePercentage = (percent) => {
    const max = maxAmount(token, pooledTokens);
    console.log("max", max.toString());
    const adjusted = max.multipliedBy(BigNumber(percent).dividedBy(100));
    amount = adjusted.toFixed(8, BigNumber.ROUND_DOWN);
  };
</script>

<style>
  .leading-26px {
    line-height: 26px;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .toggle {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 24px;
  }

  .toggle:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }

  .toggle-input:checked + .toggle {
    background-color: #aefd72;
  }

  .toggle-input:focus + .toggle {
    box-shadow: 0 0 1px #aefd72;
  }

  .toggle-input:checked + .toggle:before {
    -webkit-transform: translateX(20px);
    -ms-transform: translateX(20px);
    transform: translateX(20px);
  }

  input,
  input:focus {
    -webkit-appearance: none;
    border: none;
    border-width: 0;
    box-shadow: none;
    outline: none;
  }

  .negative {
    color: #ed34a5;
  }

  .positive {
    color: #27ba80;
  }
</style>

<div class="liquidity-container bg-grey-243 w-100pc rounded-4px p-6">
  <h1 class="text-center text-xl">{$_('general.add')} {$_('general.liquidity')}</h1>
  <div class="row flex font-thin">
    <div class="flex-auto text-right">{$_('general.single')} {$_('general.asset')}</div>
    <div class="switch mx-4">
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
      <input type="text" bind:value={amount} class="text-xl font-thin" />
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
          rounding: 4,
        })}%
      </div>
      <img
        class="token-icon my-8px w-26px h-26px"
        src={pooledToken.icon}
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
        href="https://1inch.exchange/#/r/0x3bFdA5285416eB06Ebc8bc0aBf7d105813af06d0"
        on:click={(evt) => action(evt, pooledToken)}
        target="_blank">
        {pooledToken.actionBtnLabel}
      </a>
      <div class="hidden">{$eth.address}</div>
    </div>
  {/each}

  <center>
    <button class="btn m-0 mt-4 rounded-8px px-56px py-15px">
      {$_('general.add')} {$_('general.liquidity')}
    </button>
  </center>
</div>
