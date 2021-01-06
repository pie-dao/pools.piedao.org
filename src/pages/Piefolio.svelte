<script>
  import images from "../config/images.json";

</script>
  <div class="content flex flex-col">
    <h2 class="w-full text-xl text-center mt-0 mb-2 leading-tight font-heading md:text-left md:mt-2 md:mb-6">Piefolio</h2>

    <!-- Card Container-->
    <div class="w-full flex flex-col justify-between mb-4 md:mb-6 md:flex-row lg:flex-row">
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


  <h2 class="w-full text-xl text-center mt-0 mb-0 leading-tight font-heading md:text-left md:mt-2 md:mb-0">Your Holdings</h2>

   <!-- Holdings table -->
  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Pie name</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Allocation</th>
          <th class="font-thin border-b-2 px-4 py-2">Your Balance</th>
          <th class="font-thin border-b-2 px-4 py-2">Value USD</th>
          <th class="font-thin border-b-2 px-4 py-2">Performance</th>
          <th class="font-thin border-b-2 px-4 py-2">Sparkline</th>
        </tr>
      </thead>
      <tbody>
          <tr>
            <td class="border border-gray-800 px-2 py-2 text-left">
              <img
                class="inline icon ml-2 mr-2"
                src="https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png?1598325330"
                alt="token" />
                YFI
            </td>

            <td class="border text-center px-4 py-2 font-thin relative w-50">
                <div class="w-100px percentage-bar float-left bg-pink h-6 roundedxs hidden md:block">
                  <span>12%</span>
                </div>

                <div class="block md:hidden">
                  12%
                </div>
            </td>

            <td class="border px-4 ml-8 py-2 font-thin text-center">
              324 YFI
            </td>

            <td class="border px-4 ml-8 py-2 font-thin text-center">
              1.245,30 USD
            </td>
            
            <td class="border text-center font-thin font-green px-4 py-2">
              23% 24h
            </td>

            <td class="border text-center py-2 px-4 md:px-0">
              <img
                class="w-30 spark greyoutImage mx-0"
                alt="Sparkline"
                src="https://www.coingecko.com/coins/877/sparkline" 
                style="margin: auto;" />
            </td>
          </tr>
      </tbody>
    </table>
  </div>

  <button class="table-btn-outline font-thin min-w-70px max-w-200px">Show all Assets</button> 


  <h2 class="w-full text-xl text-center mt-0 mb-4 leading-tight font-heading md:text-left md:mt-2 md:mb-4">Oven</h2>
     
  <!-- Oven Banner -->
  <div class="flex w-full flex-col items-center justify-center oven-card-bg text-white rounded-30 justify-between py-8">
      <img class="mb-2" width="40px" height="40px" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/timer-clock_23f2-fe0f.png" alt="buy YPIE" />
      <div class="w-full font-thin text-center leading-4 mb-2">Freshly baked Pies, almost Gas Free</div>
      <button class="table-btn-black min-w-70px max-w-200px">Bake now</button> 
  </div>


  <!-- Oven Table -->
  <div class="w-99pc m-4">
    <table class="breakdown-table table-auto w-full">
      <thead>
        <tr>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Oven name</th>
          <th class="font-thin border-b-2 px-4 py-2 text-left">Baking Session</th>
          <th class="font-thin border-b-2 px-4 py-2">Your ETH in the Oven</th>
          <th class="font-thin border-b-2 px-4 py-2">Pie ready to Withdraw</th>
        </tr>
      </thead>
      <tbody>
          <tr>
            <td class="border border-gray-800 px-2 py-2 text-left">
              <img
                class="inline icon ml-2 mr-2"
                src="https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png?1598325330"
                alt="token" />
                BCP
            </td>

            <td class="border px-4 ml-8 py-2 font-thin text-center">
              6.5 / 10 ETH
            </td>

            <td class="border px-4 ml-8 py-2 font-thin text-center">
              0.5 ETH
            </td>
            
            <td class="border text-center font-thin font-green px-4 py-2">
              659.40 BCP
            </td>

            <td class="border text-center font-thin font-green px-4 py-2">
              <button class="table-btn-outline font-thin min-w-70px max-w-200px">
                Open Oven
              </button>
            </td>

          </tr>
      </tbody>
    </table>
  </div>


  <h2 class="w-full text-xl text-center mt-0 mb-4 md:mb-8 leading-tight font-heading md:text-left md:mt-2 md:mb-0">Farming & Rewards</h2>

  <!-- Farming Cards -->
  <div class="w-full flex flex-col justify-between mb-4 md:mb-6 md:flex-row lg:flex-row">
      <!-- Card -->
      <div class="flex w-full md:w-1/2 bg-lightgrey p-8 mb-2 rounded-sm md:mr-2 md:mb-0">
        <div class="w-5/7"><img width="80px" height="auto" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/money-bag_1f4b0.png" alt="buy YPIE" /></div>
        <div class="w-2/7 ml-8">
          <div class="font-thin text-base">DOUGH in Escrow</div>
          <div class="text-xl">2.454,40</div>
        </div>
      </div>
      <!-- Card -->
      <div class="flex w-full md:w-1/2 bg-lightgrey p-8 rounded-sm md:ml-2">
        <div class="w-5/7"><img width="80px" height="auto" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/abacus_1f9ee.png" alt="buy YPIE" /></div>
        <div class="w-2/7 ml-8">
          <div class="font-thin text-base">Vesting Entries</div>
          <div class="text-xl">2.454,40</div>
        </div>
      </div>
  </div>

    <!-- Farm Table -->
    <div class="w-99pc m-4">
      <table class="breakdown-table table-auto w-full">
        <thead>
          <tr>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Pool name</th>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Amount Staked</th>
            <th class="font-thin border-b-2 px-4 py-2">APY</th>
            <th class="font-thin border-b-2 px-4 py-2">Rewards Available</th>
            <th class="font-thin border-b-2 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td class="border border-gray-800 px-2 py-2 text-left">
                <img
                  class="inline icon ml-2 mr-2"
                  src="https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png?1598325330"
                  alt="token" />
                  DEFI+S / ETH
              </td>
  
              <td class="border px-4 ml-8 py-2 font-thin text-center">
                87.50%
              </td>

              <td class="border px-4 ml-8 py-2 font-thin text-center">
                8342 BPT
              </td>
  
              <td class="border px-4 ml-8 py-2 font-thin text-center">
                3.159,90 DOUGH
              </td>
              
              <td class="border text-center font-thin font-green px-4 py-2">
                <a href="oven">
                  <button class="table-btn highlight-box min-w-70px">
                    Claim
                  </button>
                </a>
              </td>
            </tr>
        </tbody>
      </table>
    </div>


    <h2 class="w-full text-xl text-center mt-0 mb-0 md:mb-0 leading-tight font-heading md:text-left md:mt-2 md:mb-0">Governance</h2>

     <!-- Governance Table -->
     <div class="w-99pc m-4">
      <table class="breakdown-table table-auto w-full">
        <thead>
          <tr>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Pool name</th>
            <th class="font-thin border-b-2 px-4 py-2 text-left">Start</th>
            <th class="font-thin border-b-2 px-4 py-2">End</th>
            <th class="font-thin border-b-2 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td class="border border-gray-800 px-2 py-2 text-left truncate w-200px">
                <div class="w-70px percentage-bar float-left bg-black font-bold h-6 roundedxs"><span>Snapshot</span></div>
                &nbsp; PIP-37 Enable SUSHI/ YFI Staking on YPIE
              </td>
  
              <td class="border px-4 ml-8 py-2 font-thin text-center">
                Dec 14, 10:00 AM
              </td>

              <td class="border px-4 ml-8 py-2 font-thin text-center">
                Dec 15, 02:00 PM
              </td>
              
              <td class="border text-center font-thin font-green px-4 py-2">
                <a href="vote">
                  <button class="table-btn highlight-box min-w-70px">
                    Vote
                  </button>
                </a>
              </td>
            </tr>
        </tbody>
      </table>
    </div>



</div>



  