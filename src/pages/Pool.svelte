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
  <div class="flex flex-col flex-row-reverse md:flex-row">
    <div class="left flex-1">
      
      <div class="flex hidden md:block">
        <div class="left flex-1 mr-4">
          <Balance token={$currentRoute.params.address} />
        </div>
        <div class="left flex-1 mt-4 mr-4">
          <Farming token={$currentRoute.params.address} />
        </div>
        <div class="left flex-1 mt-4 mr-4">
          <Etherscan token={$currentRoute.params.address} />
        </div>
        <div class="right flex-1 mt-4 mr-4">
          <Quantstamp class="my-2" token={$currentRoute.params.address} />
        </div>
      </div>
      <div class="hidden md:block">
        <Info token={$currentRoute.params.address} />
      </div>
      <div class="hidden md:block">
        <AllocationBreakdown token={$currentRoute.params.address} />
      </div>
    </div>
    
    <div class="right w-full md:w-2/4 flex-1 ml-2">
      <Liquidity token={$currentRoute.params.address} />
    </div>
  </div>
</div>
