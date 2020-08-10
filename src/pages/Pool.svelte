<script>
  import AllocationBreakdown from '../components/AllocationBreakdown.svelte';
  import Balance from '../components/Balance.svelte';
  import Etherscan from '../components/Etherscan.svelte';
  import Farming from '../components/Farming.svelte';
  import Info from '../components/Info.svelte';
  import Liquidity from '../components/Liquidity.svelte';
  import Quantstamp from '../components/Quantstamp.svelte';

  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content flex flex-col">
  <div class="flex sm:flex-col md:flex-row w-100pc">
    <div class="left w-full md:w-2/4 mr-2">
      <Balance token={$currentRoute.params.address} />
      <Farming token={$currentRoute.params.address} />
      <div class="flex">
        <div class="left flex-1 mr-2">
          <Etherscan token={$currentRoute.params.address} />
        </div>
        <div class="right flex-1 ml-2">
          <Quantstamp token={$currentRoute.params.address} />
        </div>
      </div>
      <Info token={$currentRoute.params.address} />
      <div class="hidden md:block">
        <AllocationBreakdown token={$currentRoute.params.address} />
      </div>
    </div>
    
    <div class="right w-full md:w-2/4 flex-1 ml-2">
      <Liquidity method={$currentRoute.params.method} token={$currentRoute.params.address} />
    </div>
  </div>
</div>
