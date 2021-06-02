<script>
  // importing the Simulator class...
  import Simulator from '../../classes/farming_simulator/Simulator.js';
  import { formatBigMoneyAmount } from '../../components/helpers.js';
  import images from '../../config/images.json';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { formatFiat } from '../../components/helpers.js';

  import Tab1 from "./charts/Tab1.svelte";
	import Tab2 from "./charts/Tab2.svelte";
	import Tab3 from "./charts/Tab3.svelte";
  import Tabs from "./charts/Tabs.svelte";  

  function calculate() {
    // checking for inputs integrity...
    Object.keys(inputs).forEach(key => {
      switch(key) {
        case 'number':
          if(inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key];
          }
          break;
        case 'string':
          inputs[key] = inputs[key].replace(/[^0-9]/g, '');
          
          if(inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key] + '%';
          } else {
            inputs[key] += '%';
          }
          
        break;          
      }
    });

    // calculating the outputs and projections...
    simulator.calculate(inputs).then(response => {
      outputs = response.outputs;
      projections = response.breakdowns;

      tabs = [
        { label: "Expected Tot Returns",
        value: 1,
        component: Tab1
        },
        { label: "Farmed Treasury",
        value: 2,
        component: Tab2
        },
        { label: "Reward Distributions",
        value: 3,
        component: Tab3
        }
      ];      
    }).catch(error => console.error(error));  
  }

  function changeCommitment(commitment) {
    inputs.commitment = commitment;
    calculate();
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

  // defining maximum values for input fields...
  let max_values = {
    commitment: 36,
    rewardsUnclaimed: 100,
    stakedVeDough: 15000000,
    expectedApr: 100
  }  

  // rewards distrubutions, hardcoded for now...
  let rewarads = [
    {commitment: "6 Months", percentage: 12},
    {commitment: "1 Year", percentage: 18},
    {commitment: "2 Years", percentage: 23},
    {commitment: "3 Years", percentage: 37}
  ];

  // retrieving default markets infos...
  let markets = simulator.getMarkets();
  
  // fetching real market infos...
  simulator.retrieveMarkets().then(response => {
    markets = response;
  });

  // retrieving default outputs object...
  let outputs = simulator.getOutputs();
  let projections = simulator.getProjections();

  // List of tab items with labels, values and assigned components
  let tabs = [];  

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
  <div class="w-full px-8 max-w-1200px">
    <div class="font-hero font-hero-sim">New<br />Governance<br />Mining</div>
    <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a>
    <div class="text-base font-thin mx-4 md:mx-20pc mb-8">Invest in <strong>veDOUGH*</strong> and build your cashflow, taking additional yield from PieDAO farmed treasury.</div>
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
  <div class="text-base font-thin mx-4 md:mx-20pc mb-8">Tweak the parameters. We build this expensive tools so you can play being rich until you finally buy DOUGH and become rich for real.</div>
    <!-- FIRST FLEX ROW - TREASURY AND DISTRIBUTIONS -->
    <div class="flex flex-col md:flex-row gap-2 mb-2">
      <div class="w-full md:w-1/3 md:m-0px bg-lightgrey rounded text-black p-8 flex flex-shrink-0 flex-col items-left">
        <div class="font-thin leading-2 mb-4 text-left">Treasury Liquidity Deployed</div>
        <div class="w-100pc font-veryhuge tracking-tight text-left mb-4">{formatBigMoneyAmount(markets.treasuryLiquidity.amount)}</div>
        <div class="font-bold leading-2 text-left mb-4">{markets.treasuryLiquidity.eth_value} ETH</div>
      </div>

      <div class=" bg-lightgrey rounded text-black p-8 flex flex-1 flex-col md:flex-row items-left">
        <div class="w-full md:w-2/3">
          <div class="font-thin leading-2 mb-8 text-left">Rewards Distrubutions</div>
          <div class="w-full">
            <div class="font-bold mb-2 text-xs md:text-base py-1px text-left align-left rounded">
              Distributed to veDOUGH holders 
              <button style="background-color: #24D897;" class="ml-4 oven-withdraw-button">60%</button>
            </div>
          </div>
          <div class="w-full">
            <div class="font-bold mb-2 text-xs md:text-base py-1px text-left align-left rounded">
              Used to compound the treasury 
              <button  style="background-color: #CF4EB7;" class="ml-4 oven-withdraw-button">25%</button>
            </div>
          </div>
          <div class="w-full">
            <div class="font-bold mb-2 text-xs md:text-base py-1px text-left align-left rounded">
              used to cover costs 
              <button  style="background-color: #67BDF0;" class="ml-4 oven-withdraw-button">15%</button>
            </div>
          </div>
        </div>
        
        <div class="w-full md:w-1/3 align-center hidden md:block">       
          <img
            class="token-icon w-180px"
            src={images.simulator_chart}
            alt="ETH"
          />
        </div>          
      </div>      
    </div>
    <!-- SECOND FLEX ROW - TOTAL STAKED veDOUGH | REWARDS | APR -->
    <div class=" w-full bg-lightgrey rounded text-black mb-2 p-8 flex flex-col">
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
                pattern="^[0-9]*[.,]?[0-9]*$"
                minlength="1"
                maxlength="10"
                spellcheck="false"
                placeholder={inputs.stakedVeDough}
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
          <div class="md:text-xs font-thin leading-2 text-left">Total Staking Commitment</div>
          <div class="flex pt-2 md:pt-7 mb-8 md:mb-0 justify-between">
            <div class="flex flex-col justify-between">
              {#each rewarads as reward}
              <div class="flex h-18px">
                <div style={`width: ${20 * (reward.percentage/100)}rem`} class="mt-8px percentage-bar bg-black h-2 roundedxs">            
                </div>
              </div>
            {/each}
            </div>
            <div class="">
              {#each rewarads as reward}
              <div class="md:text-xs font-thin text-left">
                <span class="font-bold">{reward.percentage}%</span>
                {reward.commitment}
              </div>
            {/each}
            </div> 
          </div>
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
                type="string"
                pattern="^[0-9]*?[0-9]*$"
                minlength="1"
                maxlength="4"
                spellcheck="false"
                placeholder={inputs.expectedApr}
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
        <!-- Rewards Unclaimed -->
        <div class="w-full md:w-1/6 md:mr-8">
          <div class="md:text-xs font-thin leading-2 mb-4 text-left">Rewards Unclaimed</div>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
            <div class="flex nowrap items-center p-1">
              <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="string"
                pattern="^[0-9]*?[0-9]*$"
                minlength="1"
                maxlength="4"
                spellcheck="false"
                placeholder={inputs.rewardsUnclaimed}
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
      <div class="w-full  bg-lightgrey rounded text-black mb-2 p-8 flex flex-col">
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
                pattern="^[0-9]*[.,]?[0-9]*$"
                minlength="1"
                maxlength="10"
                spellcheck="false"
                placeholder={inputs.stakedDough}
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
          <div class="w-full flex flex-col">
            <div class="w-full font-thin text-left md:text-xs leading-2 mb-4">Your Staking Commitment</div>  
            <div class="flex items-center bg-white rounded text-center w-full p-10px mb-8 md:mt-4">
              <div class="w-1/4">
                <button class:selected="{inputs.commitment === 6}" class="bg-button" on:click={() => changeCommitment(6)}>6 months</button>
              </div>
              <div class="w-1/4">
                <button class:selected="{inputs.commitment === 12}" class="bg-button" on:click={() => changeCommitment(12)}>1 year</button>
              </div>
              <div class="w-1/4">
                <button class:selected="{inputs.commitment === 24}" class="bg-button" on:click={() => changeCommitment(24)}>2 years</button>
              </div>
              <div class="w-1/4">
                <button class:selected="{inputs.commitment === 36}" class="bg-button" on:click={() => changeCommitment(36)}>3 years</button>
              </div>
            </div>
          </div>
          <!-- <button class="w-1/4 oven-withdraw-button">custom</button> -->
        </div> 
        <div class="flex flex-col md:flex-row items-center mt-8 border-t-1 border-gray-50 pt-4">
          <div class="h-32px flex items-center">
            <div class="md:text-xs leading-3 font-thin mr-2">
              You will receive: 
            </div>   
            <div class="md:text-base mr-2">
             {outputs.user.expectedVeDough}
            </div>       
            <img
              class="token-icon w-30px h-30px"
              src={images.simulator_veDough}
              alt="ETH"
            />
            <div class="px-4px font-thin">veDOUGH</div>
          </div>
          <div class="font-thin mx-6 hidden md:block">|</div>  
          <div class="md:text-xs mt-2 md:mt-0 font-thin">For 3 years commitment: 1 DOUGH = 1 veDOUGH</div>
           
        </div>
      </div>

    <!-- FOURTH FLEX ROW - SUMMARY -->
    <div class="flex flex-row gap-2 mb-2">
      <div class="bg-lightgrey  rounded text-black p-8 flex flex-auto flex-col items-left">
        <div class="font-huge leading-2 mb-8 text-center">Summary</div>
        <div class="flex flex-col md:flex-row border-b-2 border-gray-50 pb-4">
          <div class="flex-initial w-full md:w-1/3">
            <div class="font-thin">Your Expected Returns (Yearly)</div>
            <div class="md:text-base mb-4 mt-2">{formatFiat(outputs.user.expectedYearlyReturns)}</div>
          </div>
          <div class="flex-initial w-full md:w-1/3 mt-2 md:mt-0">
            <div class="font-thin">Your Expected Returns (Monthly)</div>
            <div class="md:text-base mb-4  mt-2">{formatFiat(outputs.user.expectedAverageMontlyReturns)}</div>
          </div>
          <div class="flex-initial w-full md:w-1/3 mt-2 md:mt-0">
            <div class="font-thin">Your Expected APR</div>
            <div class="md:text-base mb-4 mt-2">{outputs.user.expectedApr}%</div>
          </div>
        </div>     
        <div class="flex flex-col md:flex-row pt-4">
          <div class="flex-initial w-full md:w-1/3 mt-4">
            <div class="font-thin">Treasury Expected Returns (Yearly)</div>
            <div class="md:text-base mb-4 mt-2">{formatFiat(outputs.treasury.expectedYearlyReturns)}</div>
          </div>
          <div class="flex-initialw-full md:w-1/3 mt-4">
            <div class="font-thin">Treasury Expected Returns (Monthly)</div>
            <div class="md:text-base mb-4 mt-2">{formatFiat(outputs.treasury.expectedAverageMontlyReturns)}</div>
          </div>

          <div class="w-full md:w-1/3 mt-4">
            <div class="font-thin">Tot veDOUGH (Yours + Others)</div>
            <div class="flex items-center justify-center w-full mt-2">
              <div class="mr-2">{formatFiat(projections.median.farming.totalStakedVeDough)}</div>
              <img
              class="token-icon w-30px h-30px"
              src={images.simulator_veDough}
              alt="ETH"
              />
              <div class="px-4px font-thin">veDOUGH</div>               
             </div> 
          </div>

        </div>      
      </div>
    </div>

    <!-- CHARTS SECTION -->
    {#key projections}
      <Tabs tabs={tabs} projections={projections}/>
    {/key}
  </div>
</div>