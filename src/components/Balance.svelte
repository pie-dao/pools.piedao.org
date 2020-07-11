<script>
  import { _ } from 'svelte-i18n';
  import { isAddress } from '@pie-dao/utils';

  import images from '../config/images.json';
  import pools from '../config/pools.json';

  import { balances, eth } from '../stores/eth.js';
  import { currentRoute } from '../stores/routes.js';
  import { balanceKey, subscribeToBalance } from './helpers.js';

  export let token;

  let balance = 'loading...';
  let key;

  $: symbol = (pools[token] || {}).symbol;
  $: tokenLogo = images.logos[symbol];

  $: if (isAddress(token) && isAddress($eth.address)) {
    key = balanceKey(token, $eth.address);
    subscribeToBalance(token, $eth.address);
  }

  $: if ($balances[key]) {
    balance = $balances[key].dp(9).toString();
  } else {
    balance = `${$_('general.loading')}...`;
  };
</script>

<div class="balance-container">
  <div class="left">
    <img src={tokenLogo} alt={symbol} />
    <h1>{symbol}</h1>
  </div>
  <div class="right">
    <span>{$_('your')} {$_('balance')}</span>
    <h5>{balance} {symbol}</h5>
  </div>
</div>