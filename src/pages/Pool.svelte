<script>
  import Balance from '../components/Balance.svelte';

  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content">
  <div class="flex w-100pc">
    <div class="left flex-1 mr-2">
      <Balance token={$currentRoute.params.address} />
    </div>
    
    <div class="right flex-1 ml-2">
      &nbsp;
    </div>
  </div>
</div>
