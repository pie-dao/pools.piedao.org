<script>
  import AllocationBreakdown from '../components/AllocationBreakdown.svelte';
  import Balance from '../components/Balance.svelte';
  import Etherscan from '../components/Etherscan.svelte';
  import Farming from '../components/Farming.svelte';
  import Info from '../components/Info.svelte';
  import Liquidity from '../components/Liquidity.svelte';
  import Quantstamp from '../components/Quantstamp.svelte';

  import images from "../config/images.json";
  import { currentRoute } from '../stores/routes.js';
</script>

<div class="content flex flex-col">
  <div class="flex flex-col w-full flex-row-reverse md:flex-row">
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
    
    <div class="right w-full md:w-2/4 flex md:flex-1 md:ml-2">
      <Liquidity token={$currentRoute.params.address} />
    </div>
    </div>
    <h1 class="mt-8 mb-4 text-base md:text-xl">Select a Pool</h1>
    <div class="flex flex-col w-full justify-center md:flex-row">

      <div class="farming-card flex flex-col justify-center align-center items-center text-center md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
        <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
        <div class="title text-lg"> ETH pool Balancer</div>
        <div class="subtitle font-thin">sometihng goes here</div>
        <div class="apy">APY 15%</div>
        <a href="#button">
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
        </a>
      </div>

      <div class="farming-card flex flex-col justify-center align-center items-center text-center md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
        <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
        <div class="title text-lg"> ETH pool Balancer</div>
        <div class="subtitle font-thin">sometihng goes here</div>
        <div class="apy">APY 15%</div>
        <a href="#button">
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
        </a>
      </div>

      <div class="farming-card flex flex-col justify-center align-center items-center text-center md:m-2 border border-gray border-opacity-50 border-solid rounded-sm p-6">
        <img class="h-40px w-40px mb-2 md:h-70px md:w-70px"src={images.logos.piedao_clean} alt="PieDAO logo" />
        <div class="title text-lg"> ETH pool Balancer</div>
        <div class="subtitle font-thin">sometihng goes here</div>
        <div class="apy">APY 15%</div>
        <a href="#button">
          <button class="btn clear font-bold ml-1 mr-0 rounded md:mr-4 py-2 px-4">Select</button>
        </a>
      </div>
      


  </div>
</div>
