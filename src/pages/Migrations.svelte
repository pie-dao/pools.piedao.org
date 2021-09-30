<script>
  import Farming from '../components/Farming.svelte';
  import Migration from '../components/Migration.svelte';
  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content flex flex-col">

  <div class="flex flex-col w-full flex-row-reverse md:flex-row">
    <div class="left flex-1">
      
      <div class="flex hidden md:block">
        <div class="left flex-1 mt-4 mr-4">
          <Farming token={$currentRoute.params.address} />
        </div>
      </div>
      <!-- <div class="hidden md:block">
        <Info token={$currentRoute.params.address} />
      </div> -->
      
    </div>
    
    <div class="right w-full md:w-2/4 flex md:flex-1 md:ml-2">
      <Migration 
        token={$currentRoute.params.address} 
        method={$currentRoute.params.method} 
        poolAction={$currentRoute.params.poolAction}
      />
    </div>
  </div>
</div>
