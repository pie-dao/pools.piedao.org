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
    src="https://assets10.lottiefiles.com/private_files/lf30_p1wdoibg.json"
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

<div class="flex flex-col items-center text-center mt-20">
<div class="w-full max-w-1200px">
  <div class="font-huge">Rewards Simulator</div>
  <div class="text-base font-thin mx-20pc mb-8">Tweak the parameters. We build this expensive tools so you can play being rich until you finally buy DOUGH and become rich for real.</div>
    <!-- FIRST FLEX ROW - TREASURY AND DISTRIBUTIONS -->
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <span class="md:text-xs leading-2 mb-4">Treasury Liquidity Deployed</span>
        <div class="w-100pc font-huge text-left mb-4">$ {formatBigMoneyAmount(markets.treasuryLiquidity.amount)}</div>
        <span class="md:text-xs leading-2">{markets.treasuryLiquidity.eth_value} ETH</span>
      </div>
      <div class="bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <span class="md:text-xs leading-2 mb-4">Rewards Distrubutions</span>
        <div class="font-bold text-xs py-1px text-left align-left float-left rounded">
          Directly distributed to veDOUGH holders <button class="ml-4 oven-withdraw-button">60%</button>
        </div>
        <div class="font-bold text-xs py-1px text-left align-left float-left rounded">
          Used to compound the treasury <button class="ml-4 oven-withdraw-button">25%</button>
        </div>
        <div class="font-bold text-xs py-1px text-left align-left float-left rounded">
          used to cover costs <button class="ml-4 oven-withdraw-button">15%</button>
        </div>  
        
        <div class="h-100px flex items-center">       
          <img
            class="token-icon w-100px h-100px"
            src={images.simulator_chart}
            alt="ETH"
          />
        </div>     
      </div> 
    </div>
    <!-- SECOND FLEX ROW - TOTAL STAKED veDOUGH | REWARDS | APR -->
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <div>
          <span class="md:text-xs leading-2 mb-4">Total Staked veDOUGH</span>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
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
                on:change={calculate}
              />
              <div class="h-32px flex items-center">
                <img
                  class="token-icon w-30px h-30px"
                  src={images.simulator_veDough}
                  alt="ETH"
                />
                <span class="py-2px px-4px">veDOUGH</span>
              </div>
            </div>
          </div>            
        </div>
        <div>
          <span class="md:text-xs leading-2 mb-4">Total Staking Commitment</span>
        </div>
        <div>
          <span class="md:text-xs leading-2 mb-4">Expected APR</span>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
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
                on:change={calculate}
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
        <div>
          <span class="md:text-xs leading-2 mb-4">Rewrds Unclaimed</span>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
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
                on:change={calculate}
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
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <div>
          <span class="md:text-xs leading-2 mb-4">Your Staked DOUGH</span>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mt-8">
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
                on:change={calculate}
              />
              <div class="h-32px flex items-center">
                <img
                  class="token-icon w-30px h-30px"
                  src={images.doughtoken}
                  alt="ETH"
                />
                <span class="py-2px px-4px">DOUGH</span>
              </div>
            </div>
          </div>                 
        </div>
        <div class="col-span-2 flex items-center">
          <span class="md:text-xs leading-2 mb-4">Your Staking Commitment</span>  
          <div class="flex bg-white rounded text-center w-3/4">
            <div class="flex-initial w-1/4">
              <button class="">6 months</button>
            </div>
            <div class="flex-initial w-1/4">
              <button class="">1 year</button>
            </div>
            <div class="flex-initial w-1/4">
              <button class="">2 years</button>
            </div>
            <div class="flex-initial w-1/4">
              <button class="">3 years</button>
            </div>
          </div>

          <!-- <button class="w-1/4 oven-withdraw-button">custom</button> -->
        </div> 
        <div>
          <div class="h-32px flex items-center">
            <span class="md:text-xs leading-2 mb-4">
              You will receive: {outputs.user.expectedVeDough}
            </span>         
            <img
              class="token-icon w-30px h-30px"
              src={images.simulator_veDough}
              alt="ETH"
            />
            <span class="py-2px px-4px">veDOUGH</span>
          </div>             
        </div>
        <div class="col-span-2">
          <span class="md:text-xs leading-2 mb-4">For 3 years commitment: 1 DOUGH = 1 veDOUGH</span>
        </div>       
      </div>
    </div>

    <!-- FOURTH FLEX ROW - SUMMARY -->
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey rounded text-black pt-8 pb-2 px-2 md:px-6 flex flex-auto flex-col items-left">
        <span class="md:text-xl leading-2 mb-4">Summary</span>
        <div class="flex flex-row border-b-2 mb-4 pb-4">
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Your Expected Returns (Yearly)</span>
            <div class="md:text-s leading-2 mt-4">${outputs.user.expectedYearlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Your Expected Returns (Monthly)</span>
            <div class="md:text-s leading-2 mt-4">${outputs.user.expectedAverageMontlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Your Expected APR</span>
            <div class="md:text-s leading-2 mt-4">{outputs.user.expectedApr}%</div>
          </div>
        </div>     
        <div class="flex flex-row">
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Treasury Expected Returns (Yearly)</span>
            <div class="md:text-s leading-2 mt-4">$ {outputs.treasury.expectedYearlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Treasury Expected Returns (Monthly)</span>
            <div class="md:text-s leading-2 mt-4">$ {outputs.treasury.expectedAverageMontlyReturns}</div>
          </div>
          <div class="flex-initial w-1/3">
            <span class="md:text-xs leading-2 mb-4">Tot veDOUGH (Yours + Others)</span>
            
            <div class="h-32px flex items-center">
              <div class="md:text-s leading-2 mt-4">$ {projections.farming.totalStakedVeDough}</div>
              <img
                class="token-icon w-30px h-30px"
                src={images.simulator_veDough}
                alt="ETH"
              />
              <span class="py-2px px-4px">veDOUGH</span>
            </div>        
          </div>
        </div>      
      </div>
    </div>
  </div>
</div>
