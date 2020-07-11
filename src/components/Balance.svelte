<script>
  import { _ } from 'svelte-i18n';
  import { isAddress } from '@pie-dao/utils';

  import images from '../config/images.json';

  import { balances, eth } from '../stores/eth.js';
  import { currentRoute } from '../stores/routes.js';
  import { balanceKey, subscribeToBalance } from './helpers.js';

  export let token;

  let balance = 'loading...';
  let key;

  $: if (isAddress(token) && isAddress($eth.address)) {
    key = balanceKey(token, $eth.address);
    subscribeToBalance(token, $eth.address);
  }

  $: if ($balances[key]) {
    balance = $balances[key].toString();
  } else {
    balance = 'loading...'
  };
</script>

<div class="balance-container">
  <div>Pool: {token}</div>
  <div>Balance: {balance}</div>  
</div>