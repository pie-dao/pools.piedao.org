<script>
  import { currentRoute } from '../stores/routes.js';
  import { balances, eth, trackToken } from '../stores/eth.js';

  $: balanceKey = `${$eth.address}.${$currentRoute.params.address}`.toLowerCase();

  trackToken($currentRoute.params.address);
</script>

<div>Pool: {$currentRoute.params.address}</div>
<div>Balance: {($balances[balanceKey] || 'fetching...').toString()}</div>