<script>

import images from "../config/images.json";

</script>


<div class="liquidity-container bg-grey-243 rounded-4px p-4 w-100pc md:p-6 ">

  <p class="text-center font-thin my-4 mx-2">
    <div class="text-left md:my-16px md:mx-20px">
      Using Single asset Entry, you can use ETH to mint a Pie in one transaction.
      <br> Single Asset Entry fetches the underlying assets for you from external markets like Uniswap, because of that slippage might apply.
      <strong>5% more ETH</strong> are sent during the TX to avoid unxpected errors, any unused ETH is returned.
    </div>
    
    <div class="input bg-white border border-solid rounded-8px border-grey-204 mx-0 md:mx-4">
      <div class="top h-32px text-sm font-thin px-4 py-4 md:py-2">
        <div class="left float-left">Amount</div>
        <div class="right text-white font-bold text-xs py-1px text-center align-right float-right rounded">
          <div class="percentage-btn inline-block rounded-20px h-20px bg-black w-50px cursor-pointer">100%</div>
        </div>
      </div>
      <div class="bottom  px-4 py-4 md:px-4 pb-4">
        <input type="number" class="font-thin text-base w-60pc md:w-75pc md:text-xl">
        <div class="asset-btn float-right h-32px bg-grey-243 rounded-32px px-2px flex
      align-middle justify-center items-center pointer mt-0 md:mt-14px">
      <img class="token-icon w-20px h-20px md:h-26px md:w-26px my-4px mx-2px" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" alt="ETH">
      <span class="py-2px px-4px">ETH</span></div> 
    </div>
  </div>



  <button class="btn m-0 mt-4 rounded-8px px-56px py-15px" >Bake</button>


    </div>