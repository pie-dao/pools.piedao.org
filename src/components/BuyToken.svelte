<script>
  import { _ } from "svelte-i18n";
  import poolsConfig from "../config/pools.json";
  export let token;
  $: tokenSymbol = (poolsConfig[token] || {}).symbol;
  let tokenDetails = poolsConfig[token].buyToken; 
</script>

<div class="liquidity-container bg-grey-243 w-100pc rounded-4px p-6">
  <h1 class="text-center text-xl">
      {$_('general.buy')} {tokenSymbol}
  </h1>
  <br/>

  {#each tokenDetails as tokenDetail}
    <div class="token-summary bg-white rounded-8px mx-4 my-4px flex">
      <div class="p-12px text-sm w-75px">
        <img
          class="token-icon my-8px w-26px h-26px"
          src={tokenDetail.logo}
          alt={tokenDetail.exchange-name} />
      </div>
      <div class="token-symbol px-6px py-18px">
        {tokenDetail.name}
      </div>
      <div class="token-symbol px-16px py-18px">
        {tokenDetail.type}
      </div>
      <div class="token-symbol px-16px py-18px align-right">
        <a
          href={tokenDetail.link}
          class="percentage-btn text-center text-white inline-block rounded-20px h-25px bg-black w-50px cursor-pointer"
          target="_blank">
          {$_('general.buy')}
        </a>
      </div>
    </div>
  {/each}
</div>
