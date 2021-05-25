<script>
  // importing the Simulator class...
  import Simulator from '../classes/farming_simulator/Simulator.js';
  import { formatBigMoneyAmount } from '../components/helpers.js';
  import images from '../config/images.json';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';

  function calculate() {
    console.log("going to calculate using inputs", inputs);
    simulator.calculate(inputs).then(response => {
      outputs = response.outputs;
      projections = response.breakdowns;
    }).catch(error => console.error(error));  
  }
  
  // creating the Simulator class instance...
  let simulator = new Simulator();

  // filling the first default values...
  let inputs = {
    stakedDough: 100000,
    commitment: 36,
    rewardsUnclaimed: "10%",
    stakedVeDough: 4500000,
    expectedApr: "50%"
  };

  // rewards distrubutions, hardcoded for now...
  let rewarads = {
    6: 12,
    12: 18,
    24: 23,
    36: 37
  };

  // retrieving default markets infos...
  let markets = simulator.getMarkets();
  
  // fetching real market infos...
  simulator.retrieveMarkets().then(response => {
    markets = response;
  });

  // retrieving default outputs object...
  let outputs = simulator.getOutputs();
  let projections = simulator.getProjections();

  // calculating real outputs...
  calculate();

  // lottie...
  let controlsLayout = [
  'previousFrame',
  'playpause',
  'stop',
  'nextFrame',
  'progress',
  'frame',
  'loop',
  'spacer',
  'background',
  'snapshot',
  'zoom',
  'info',
];
</script>

<div class="flex flex-col items-center text-center mt-8">
  <div class="w-full max-w-1200px">
    <div class="font-hero">New<br />Governance<br />Mining</div>
    <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a>
    <div class="text-base font-thin mx-20pc mb-8">Invest in <strong>veDOUGH*</strong> and build your cashflow, taking additional yield from PieDAO famed treasury.</div>
    <div class="font-huge">How it works</div>
    <LottiePlayer
    src="https://assets10.lottiefiles.com/private_files/lf30_wksf88hl.json"
    autoplay="{true}"
    loop="{true}"
    controls="{false}"
    renderer="svg"
    background="white"
    height=""
    width="100%"
    controlsLayout="{controlsLayout}"
  />
</div>
</div>

<div class="flex flex-col items-center text-center mt-20 m-5">
<div class="w-full max-w-1200px">
  <div class="font-huge">Rewards Simulator</div>
  <div class="text-base font-thin mx-20pc mb-8">Tweak the parameters. We build this expensive tools so you can play being rich until you finally buy DOUGH and become rich for real.</div>
    <!-- FIRST FLEX ROW - TREASURY AND DISTRIBUTIONS -->
    <div class="flex flex-col md:flex-row gap-2 mb-2">
      <div class=" md:m-0px pl-4 bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-shrink-0 flex-col items-left">
        <div class="font-thin leading-2 mb-4 text-left">Treasury Liquidity Deployed</div>
        <div class="w-100pc font-huge text-left mb-4">$ {formatBigMoneyAmount(markets.treasuryLiquidity.amount)}</div>
        <div class="font-thin leading-2 text-left mb-4">{markets.treasuryLiquidity.eth_value} ETH</div>
      </div>

      <div class=" bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-1 flex-col items-left">
        <div class="w-full md:w-1/2">
          <div class="font-thin leading-2 mb-4 text-left">Rewards Distrubutions</div>
          <div class="font-bold text-xs md:text-base py-1px text-left align-left float-left rounded">
            Directly distributed to veDOUGH holders 
            <button class="ml-4 oven-withdraw-button">60%</button>
          </div>
          <div class="font-bold text-xs md:text-base py-1px text-left align-left float-left rounded">
            Used to compound the treasury <button class="ml-4 oven-withdraw-button">25%</button>
          </div>
          <div class="font-bold text-xs md:text-base py-1px text-left align-left float-left rounded">
            used to cover costs <button class="ml-4 oven-withdraw-button">15%</button>
          </div>            
        </div>
        
        <div class="w-1/2">       
          <img
            class="token-icon w-50px h-50px"
            src={images.simulator_chart}
            alt="ETH"
          />
        </div>          
      </div>      
    </div>
    <!-- SECOND FLEX ROW - TOTAL STAKED veDOUGH | REWARDS | APR -->
    <div class=" w-full bg-lightgrey rounded text-black mb-2 pt-8 pb-2 px-2 md:px-6 flex flex-col">
      <div class="w-full flex flex-col md:flex-row">
        <!-- Total Staked veDOUGH -->
        <div class="w-full md:w-2/6 md:mr-8">
          <div class="md:text-xs font-thin leading-2 mb-4 text-left">Total Staked veDOUGH</div>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="number"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder="0.0"
                minlength="1"
                maxlength="79"
                spellcheck="false"
                bind:value={inputs.stakedVeDough}
                on:keyup={calculate}
              />
              <div class="h-32px flex items-center">
                <img
                  class="token-icon w-30px h-30px"
                  src={images.simulator_veDough}
                  alt="ETH"
                />
                <div class="py-2px px-4px">veDOUGH</div>
              </div>
            </div>
          </div>            
        </div>
        <!-- Total Staking Commitment -->
        <div class="w-full md:w-2/6 md:mr-8">
          <div class="md:text-xs font-thin leading-2 mb-4 text-left">Total Staking Commitment</div>
          <div class="p-4">some content goes in here...</div>
        </div>
        <!-- Expected APR -->
        <div class="w-full md:w-1/6 md:mr-8">
          <div class="md:text-xs font-thin leading-2 mb-4 text-left">Expected APR</div>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="text"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder={inputs.expectedApr}
                minlength="1"
                maxlength="79"
                spellcheck="false"
                bind:value={inputs.expectedApr}
                on:keyup={calculate}
              />
              <div class="h-32px flex items-center">
                <img
                  class="token-icon w-30px h-30px"
                  src={images.simulator_launch}
                  alt="ETH"
                />
              </div>
            </div>
          </div>            
        </div>
        <!-- Rewrds Unclaimed -->
        <div class="w-full md:w-1/6 md:mr-8">
          <div class="md:text-xs font-thin leading-2 mb-4 text-left">Rewrds Unclaimed</div>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="text"
                pattern="^[0-9]*[.]?[0-9]*$"
                placeholder={inputs.rewardsUnclaimed}
                minlength="1"
                maxlength="79"
                spellcheck="false"
                bind:value={inputs.rewardsUnclaimed}
                on:keyup={calculate}
              />
              <div class="h-32px flex items-center">
                <img
                  class="token-icon w-30px h-30px"
                  src={images.simulator_sword}
                  alt="ETH"
                />
              </div>
            </div>
          </div>                
        </div>  
      </div>
    </div>
    <!-- THIRD FLEX ROW - YOUR STAKED DOUGH | COMMITMENT -->
      <div class="w-full  bg-lightgrey rounded text-black mb-2 pt-8 pb-2 px-2 md:px-6 flex flex-col">
        <div class="w-full flex flex-col md:flex-row">
          <div class="w-full md:w-1/3 md:mr-8">
            <div class="w-full font-thin text-left md:text-xs leading-2 mb-4">Your Staked DOUGH</div>
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
              <div class="flex nowrap items-center p-1">
                <input
                  class="swap-input-from"
                  inputmode="decimal"
                  autocomplete="off"
                  autocorrect="off"
                  type="number"
                  pattern="^[0-9]*[.]?[0-9]*$"
                  placeholder="0.0"
                  minlength="1"
                  maxlength="79"
                  spellcheck="false"
                  bind:value={inputs.stakedDough}
                  on:keyup={calculate}
                />
                <div class="h-32px flex items-center">
                  <img
                    class="token-icon w-30px h-30px"
                    src={images.doughtoken}
                    alt="ETH"
                  />
                  <div class="py-2px px-4px">DOUGH</div>
                </div>
              </div>
            </div>                 
          </div>
          <div class="w-full md:w-2/3 flex flex-col">
            <div class="w-full font-thin text-left md:text-xs leading-2 mb-4">Your Staking Commitment</div>  
            <div class="flex items-center bg-white rounded text-center w-3/4 p-26px mb-8 md:mt-8">
              <div class="w-1/4">
                <button class="focus:bg-pink">6 months</button>
              </div>
              <div class="w-1/4">
                <button class="commitment-btn">1 year</button>
              </div>
              <div class="w-1/4">
                <button class="focus:bg-toto">2 years</button>
              </div>
              <div class="w-1/4">
                <button class="focus:commitment-btn">3 years</button>
              </div>
            </div>
          </div>
          <!-- <button class="w-1/4 oven-withdraw-button">custom</button> -->
        </div> 
        <div class="flex items-center mt-8 border-t-2 border-gray-50 pt-4">
          <div class="h-32px flex items-center">
            <div class="md:text-xs leading-2 font-thin mr-2">
              You will receive: 
            </div>   
            <div class="md:text-base leading-2 mr-2">
             {outputs.user.expectedVeDough}
            </div>       
            <img
              class="token-icon w-30px h-30px"
              src={images.simulator_veDough}
              alt="ETH"
            />
            <div class="px-4px font-thin">veDOUGH</div>
          </div>
          <div class="font-thin mx-6">|</div>  
          <div class="md:text-xs leading-2 font-thin">For 3 years commitment: 1 DOUGH = 1 veDOUGH</div>
           
        </div>
      </div>

    <!-- FOURTH FLEX ROW - SUMMARY -->
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey  rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <div class="font-huge leading-2 mb-8 text-left">Summary</div>
        <div class="flex flex-row border-b-2 border-gray-50 pb-4">
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Your Expected Returns (Yearly)</div>
            <div class="md:text-base leading-2 mt-4">${outputs.user.expectedYearlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Your Expected Returns (Monthly)</div>
            <div class="md:text-base leading-2 mt-4">${outputs.user.expectedAverageMontlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Your Expected APR</div>
            <div class="md:text-base leading-2 mt-4">{outputs.user.expectedApr}%</div>
          </div>
        </div>     
        <div class="flex flex-row pt-4">
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Treasury Expected Returns (Yearly)</div>
            <div class="md:text-base leading-2 mt-4">$ {outputs.treasury.expectedYearlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Treasury Expected Returns (Monthly)</div>
            <div class="md:text-base leading-2 mt-4">$ {outputs.treasury.expectedAverageMontlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <div class="leading-2 mb-4 font-thin">Tot veDOUGH (Yours + Others)</div>
            <div class="md:text-base leading-2 mr-2">
              ${projections.farming.totalStakedVeDough}
              <img
              class="w-30px h-30px"
              src={images.simulator_veDough}
              alt="ETH"
              />
              <div class="px-4px font-thin">veDOUGH</div>               
             </div>    
          </div>
        </div>      
      </div>
    </div>
  </div>
</div>
