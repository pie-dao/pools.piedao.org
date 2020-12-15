<script>
  import images from '../../config/images.json';
  import Snapshot from '../../components/Snapshot.svelte';


</script>


<div class="liquidity-container bg-grey-243 rounded-4px p-8 w-100pc md:p-10 ">

  
    <center>
      <div class="flex flex-wrap w-full text-left">
        <div class="flex flex-row content-between justify-between flex-wrap w-full">
          <div class="flex flex-row sm:w-full md:w-1/3">
            <a href="token"><img class="h-80px inline" src={images.aave} alt="token name" /></a>
            <div class="mx-3 flex flex-col justify-center">
              <a href="token">
                <h1 class="text-xl leading-none font-black">YFI</h1>
                <h2 class="text-md leading-none font-black">Yearn Finance</h2>
              </a>
                <h5 class="text-xl leading-none font-thin relative">$235 <span class="text-lg absolute font-black" style="top: 5px; right: -100px;">2.34</span></h5>
            </div>
          </div>
          <button class="w-1/2 btn text-white font-bold ml-0 mr-1 rounded md:w-1/4 md:ml-4 py-2 px-4">Visit Website</button>
        </div>
      </div>

      <div class="content flex flex-col mt-4 text-left">
        <div>
          <h1 class="font-lg">Description:</h1>
          <span class="font-thin">
            Yearn Finance is a suite of products in Decentralized Finance (DeFi) that provides lending aggregation, yield generation, and insurance on the Ethereum blockchain. The protocol is maintained by various independent developers and is governed by YFI holders. <br />
            YTokens are like a deposit receipt. They represent the liquidity provided in a Yearn product.
            If the product you are providing liquidity to generates profit, your yTokens will increase in value, since they represent a share of that pool. That's why you might observe a price growth. When you withdraw liquidity from the pool, your yToken will be burned.         
          </span>  
          <div class="font-lg mt-10">CHART GOES HERE:</div>
          <div class="font-lg text-left mt-10">Active Proposals</div>
    
          <Snapshot />  
        </div>

      </div>

      
    

          


    </center>
</div>