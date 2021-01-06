<script>
  import images from "../config/images.json";

</script>
  <div class="content flex flex-col">
    <h2 class="w-full text-xl text-center mt-0 mb-2 leading-tight font-heading md:text-left md:mt-2 md:mb-6">Piefolio</h2>

    <!-- Card Container-->
    <div class="w-full flex flex-col justify-between md:flex-row lg:flex-row">
      <!-- Balance Card -->
      <div class="flex flex-col w-full balance-card-bg text-white rounded-30 px-8 mb-2 md:flex-row md:w-1/2 md:mr-2 md:mb-0">
        <div class="flex flex-col items-middle py-4 md:py-14 lg:py-16 w-full md:w-3/5 lg:w-3/5">
          <span class="text-xl md:text-xxl lg:text-xxl">$12.764,30</span>
          <span class="text-base font-thin">+2.5% ($745,30)</span>
        </div>
        <div class="hidden md:flex items-end overflow-hidden text-black w-full justify-center md:justify-start md:w-2/5 lg:w-2/5">
          <div class="foliobars bg-aave h-24"><div class="text-vertical">USD++</div></div>
          <div class="foliobars bg-compound h-28"><div class="text-vertical">USD++</div></div>
          <div class="foliobars bg-cream h-32"><div class="text-vertical">USD++</div></div>
          <div class="foliobars bg-cream h-44"><div class="text-vertical">USD++</div></div>
        </div>
      </div>
      <!-- Promo Card -->
      <div class="flex w-full buy-YPIE-bg text-white rounded-30 justify-between md:w-1/2 md:ml-2">
        <div class="w-1/2 flex flex-col justify-center pl-2"><img src={images.bannerhands} alt="buy YPIE" /></div>
        <div class="w-1/2 flex flex-col items-center justify-center my-4 pr-2">
          <div class="w-full font-thin text-center leading-4">Go and Get</div>
          <div class="w-full text-center text-base md:text-xl leading-8 md:leading-12">135% APY</div>   
          <button class="table-btn highlight-box min-w-70px max-w-200px">Buy YPIE</button> 
      </div>
    </div>
  </div>
</div>



  