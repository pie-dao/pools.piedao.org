<script>
  import { _ } from 'svelte-i18n';
  import { isAddress } from '@pie-dao/utils';

  import images from '../config/images.json';
  import pools from '../config/pools.json';

  import { balanceKey, balances, eth } from '../stores/eth.js';
  import { currentRoute } from '../stores/routes.js';
  import { subscribeToBalance } from './helpers.js';

  export let token;

  let balance = 'loading...';
  let key;
  let balanceClass = 'blur-heavy';
  let yourBalanceClass = 'blur-light';

  $: symbol = (pools[token] || {}).symbol;
  $: tokenLogo = images.logos[symbol];

  $: if (isAddress(token) && isAddress($eth.address)) {
    balanceClass = '';
    yourBalanceClass = '';
    key = balanceKey(token, $eth.address);
    subscribeToBalance(token, $eth.address);
  }

  $: if ($balances[key]) {
    console.log('balance', key, $balances[key]);
    balance = $balances[key].dp(9).toString();
  } else {
    console.log('no balance', key)
    balance = `${$_('general.loading')}...`;
  };
</script>

<div class="balance-container">
  <div class="left">
    <img src={tokenLogo} alt={symbol} />
    <h1>{symbol}</h1>
  </div>
  <div class="right">
    <span class={yourBalanceClass}>{$_('your')} {$_('balance')}</span>
    <h5 class={balanceClass}>{balance} {symbol}</h5>
  </div>
</div>