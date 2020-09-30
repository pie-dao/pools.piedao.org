<script>
  import { _ } from "svelte-i18n";
  import { isAddress } from "@pie-dao/utils";

  import images from "../config/images.json";
  import pools from "../config/pools.json";

  import { balanceKey, balances, eth } from "../stores/eth.js";
  import { currentRoute } from "../stores/routes.js";
  import { subscribeToBalance } from "./helpers.js";

  export let token;

  let balance = "loading...";
  let key;
  let balanceClass = "blur-heavy";
  let yourBalanceClass = "blur-light";

  $: symbol = (pools[token] || {}).symbol;
  $: tokenLogo = images.logos[token];

  const address = $eth.address || window.localStorage.getItem('address');

  $: if (isAddress(token) && isAddress(address)) {
    balanceClass = "";
    yourBalanceClass = "";
    key = balanceKey(token, address);
    subscribeToBalance(token, address);
  }

  $: if ($balances[key]) {
    balance = $balances[key].dp(9).toString();
  } else {
    balance = ``;
  }
</script>

<div class="small-balance-container">
    <div class="flex flex-col">
        <div class="flex flex-row">
            <img src={tokenLogo} alt={symbol} />
            <h1>{symbol}</h1>
        </div>
        <h3 class={yourBalanceClass}>{balance}</h3>
    </div>
</div>
