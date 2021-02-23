<script>
  import images from "../config/images.json";
  import Holdings from "../components/piefolio/Holdings.svelte";
  import Allocation from "../components/piefolio/Allocation.svelte";
  import Oven from "../components/piefolio/Oven.svelte";
  import Governance from "../components/piefolio/Governance.svelte";
  import Farming from "../components/piefolio/Farming.svelte";
  import Banner from "../components/piefolio/Banner.svelte";
  import Exchange from "../components/piefolio/Exchange.svelte";


</script>


<div class="hidden md:flex w-100pc py-20px flex flex-col items-center">
  <div class="flex items-start mx-4 md:max-w-1280px">
    <div class="flex flex-col w-60pc mr-2pc">
      <span class="mb-4"><Holdings /></span>
      <span class="mt-2 mb-2"><Allocation /></span>
    </div>
    <div class="flex flex-col w-38pc">
      <span class="mb-1"><Banner /></span>
      <span class="mt-1 mb-1"><Exchange /></span>
      <span class="mt-1 mb-1"><Oven /></span>
      <span class="mt-1 mb-1"><Governance /></span>
      <span class="mt-1 mb-1"><Farming /></span>
    </div>
</div>
</div>

<div class="flex md:hidden flex-col mx-2">
  <span class="mb-2"><Banner /></span>
  <span class="mb-2"><Holdings /></span>
  <span class="mb-2"><Allocation /></span>
  <span class="-mt-20px mb-2"><Oven /></span>
  <span class="-mt-20px mb-2"><Governance /></span>
  <span class="-mt-20px mb-2"><Farming /></span>
  <span class="-mt-20px"><Exchange /></span>

</div>

 



  