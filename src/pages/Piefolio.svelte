<script>
  import images from "../config/images.json";
  import Holdings from "../components/piefolio/Holdings.svelte";
  import Allocation from "../components/piefolio/Allocation.svelte";
  import Oven from "../components/piefolio/Oven.svelte";
  import Governance from "../components/piefolio/Governance.svelte";
  import Farming from "../components/piefolio/Farming.svelte";
  import Banner from "../components/piefolio/Banner.svelte";

</script>


<div class="w-100pc md:max-w-1280px flex m-auto items-start overflow-hidden py-20px">

  <div class="flex flex-col w-60pc mr-2pc">
    <Holdings />
    <Allocation />
  </div>


  <div class="flex flex-col w-38pc">
    <Banner />
    <Oven />
    <Governance />
    <Farming />
  </div>

</div>

 



  