<script>
  import revenuesJSON from '../../../config/dao-revenues.json';
  import { formatFiat } from '../../../components/helpers.js';
  import images from '../../../config/images.json';

  export let timestamp;
  let revenue = revenuesJSON.revenues.find(revenue => revenue.startDate <= timestamp && revenue.endDate >= timestamp);
  console.log(revenue);
</script>

<div class="flex flex-col items-center w-full md:w-1/2 p-1px bg-lightgrey rounded-16 m-10px">
  <div class="flex flex-col nowrap w-96pc m-2pc swap-from rounded-20px bg-white p-16px">
    <div class="font-huge text-left pb-4">DAO Revenues</div>
      <div class="flex flex-row p-1 justify-between items-center">
        <div class="flex items-center">
          <span class="font-thin">Tot Revenues</span>          
        </div>
        <div class="flex flex-col items-right">
          <div class="font-24px">
            {formatFiat(revenue.total, ',', '.', '$')}
          </div>
        </div>
      </div>

      {#each revenue.breakdowns as breakdown}
      <div class="flex flex-row p-1 justify-between items-center mt-4">
        <div class="flex items-center">
          <span class="token-symbol-container">{breakdown.title}</span>          
        </div>
        <div class="flex flex-col items-right">
          <div class="">
            {formatFiat(breakdown.total, ',', '.', '$')}
          </div>        
        </div>       
      </div>

      {#each breakdown.underlyings as underlying}
        <div class="flex flex-row p-1 justify-between items-center">
          <div class="flex items-center">
            {#if underlying.address}
              <img class="h-auto w-24px mr-10px" src={images.logos[underlying.address]} alt={underlying.symbol} />
            {/if}
            <span class="token-symbol-container font-thin">{underlying.symbol}</span>          
          </div>
          <div class="flex flex-col items-right">
            <div class="">
              {(underlying.fiat ? underlying.fiat: "") + " " + underlying.amount} 
            </div>        
          </div>
        </div>
      {/each}       
    {/each}      
  </div>
</div>