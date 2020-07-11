<script>
  import Balance from '../components/Balance.svelte';

  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content">
  <div class="left">
    <Balance token={$currentRoute.params.address} />
  </div>
  
  <div class="right">
  
  </div>
</div>
