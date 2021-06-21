<script>
  // importing the Simulator class...
  import Simulator from '../../classes/farming_simulator/Simulator.js';
  import { formatBigMoneyAmount } from '../../components/helpers.js';
  import images from '../../config/images.json';
  import displayNotification from '../../notifications';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { formatFiat } from '../../components/helpers.js';
  import { currentRoute } from "../../stores/routes.js";
  import InfoModal from '../../components/modals/infoModal.svelte';
  import StakingCommitmentModal from '../../components/modals/stakingCommitmentModal.svelte';
  import Modal from '../../components/elements/Modal.svelte';

  import Tab1 from "./charts/Tab1.svelte";
	import Tab2 from "./charts/Tab2.svelte";
	import Tab3 from "./charts/Tab3.svelte";
  import Tabs from "./charts/Tabs.svelte";  

  import firebase from 'firebase';
  import firebase_env from '../../config/firebase.json';

  function getPermalink() {
    if(permalink_url) {
      updateSimulation();
    } else {
      saveSimulation();
    }
  }

  function saveSimulation() {
    firebase.firestore().collection('staking_simulations')
      .add({inputs: inputs, rewards: rewards, name: simulation.name, author: simulation.author})
      .then(response => {
      simulationChanged = false;
      permalink_url = window.location + response.id;
      console.log(permalink_url);
    }).catch(error => {
      console.error(error);
    });  
  }

  function updateSimulation() {
    firebase.firestore().collection('staking_simulations')
      .doc($currentRoute.params.simulation)
      .set({inputs: inputs, rewards: rewards, name: simulation.name, author: simulation.author})
      .then(() => {
        simulationChanged = false;
    }).catch(error => {
      console.error(error);
    }); 
  }

  function loadSimulation() {
    if($currentRoute.params.simulation != '') {
      firebase.firestore().collection('staking_simulations').doc($currentRoute.params.simulation).get().then(response => {
        if(response.exists) {
          permalink_url = window.location;
          let data = response.data();

          inputs = data.inputs;
          rewards = data.rewards;
          simulation.name = data.name;
          simulation.author = data.author;

          simulation = simulation;
          inputs = inputs;
          rewards = rewards;
        } else {
          history.replaceState({}, document.title, window.location.href.replace($currentRoute.params.simulation, "")); 

          displayNotification({
          message: 'Sorry, this simulation does not exist on our database.',
          type: "error",
          });   
        }
      }).catch(error => {
        console.error(error);
      });    
    }    
  }

  function updateSimulator(event) {
    rewards = event.detail.rewards;
    inputs.stakedVeDough = formatFiat(event.detail.stakedVeDough, ',', '.', '');
    estimated_dough_value = event.detail.estimated_dough_value;
    calculate();
    sliderModal.close();
  }

  function setCommitment(months) {
    inputs.commitment = `${months} Months`;
    format();
  }

  function format() {
    // checking for inputs integrity...
    Object.keys(inputs).forEach(key => {
      switch(key) {
        case 'commitment':
          inputs[key] = inputs[key].replace(/[^0-9]/g, '');

          if(inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key] + ' Months';
          } else {
            inputs[key] += ' Months';
          }
          break;
        case 'stakedDough':
        case 'stakedVeDough':
          inputs[key] = parseFloat(inputs[key].replace(/[^0-9.]/g, ''));

          if(inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key];
          }

          inputs[key] = formatFiat(inputs[key], ',', '.', '');
          break;          
        case 'rewardsUnclaimed':
        case 'expectedApr':          
          inputs[key] = inputs[key].replace(/[^0-9]/g, '');
          
          if(inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key] + '%';
          } else {
            inputs[key] += '%';
          }
          
        break;          
      }
    });

    calculate();
  }

  function calculate(changed = true) {
    // calculating the outputs and projections...
    simulator.calculate(inputs).then(response => {
      simulationChanged = changed;

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

  function openModal(content_key) {
    modal_content_key = content_key;
    modal.open();
  }

  // modal instance...
  let modal;
  let sliderModal;
  let modal_content_key;
  let estimated_dough_value;
  
  // creating the Simulator class instance...
  let simulator = new Simulator();

  // defining maximum values for input fields...
  let max_values = {
    commitment: 36,
    rewardsUnclaimed: 100,
    stakedVeDough: 15000000,
    expectedApr: 100
  } ;

  // filling the first default values...
  let inputs = {
    stakedDough: formatFiat(100000, ',', '.', ''),
    commitment: "36 Months",
    rewardsUnclaimed: "10%",
    stakedVeDough: 0,
    expectedApr: "50%"
  };  

  // rewards distrubutions, hardcoded for now...
  let rewards = [
    {commitment: "6 Months", months: 6, percentage: 12},
    {commitment: "1 Year", months: 12, percentage: 18},
    {commitment: "2 Years", months: 24, percentage: 23},
    {commitment: "3 Years", months: 36, percentage: 47}
  ];

  // retrieving default markets infos...
  let markets = simulator.getMarkets();
  
  // fetching real market infos...
  simulator.retrieveMarkets().then(response => {
    markets = response;
    estimated_dough_value = markets.dough.circSupply * 0.2;

    let stakedVeDough = 0;

    rewards.forEach(reward => {
      let stakedDoughPercentage = estimated_dough_value * (reward.percentage / 100);
      stakedVeDough += simulator.calculator.calculateVeDough(stakedDoughPercentage, reward.months);
    });

    inputs.stakedVeDough = formatFiat(stakedVeDough, ',', '.', '');
  });

  // retrieving default outputs object...
  let outputs = simulator.getOutputs();
  let projections = simulator.getProjections();

  // List of tab items with labels, values and assigned components
  let tabs = [];  

  // calculating real outputs...
  calculate(false);

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

  // firebase variables...
  let firebase_app = null;
  let permalink_url = null;
  let simulationChanged = false;
  let simulation = {
    name: '',
    author: ''
  }

  // initialize firebase app instance...
  if (!firebase.apps.length) {
    firebase_app = firebase.initializeApp(firebase_env);
  } else {
    firebase_app = firebase.app();
  }

  // checking if we have to load an already-existing configuration...
  loadSimulation();
</script>

<Modal backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <InfoModal description_key={modal_content_key}/>
  </span>
</Modal>

<Modal backgroundColor="#f3f3f3" bind:this={sliderModal}>
  <span slot="content">
    <StakingCommitmentModal rewards={rewards} estimated_dough_value={estimated_dough_value} dough_circulation_supply={markets.dough.circSupply} on:applyConfig={updateSimulator}/>
  </span>
</Modal>

<div class="flex flex-col items-center text-center mt-8">
  <div class="w-full flex flex-col items-center px-8 max-w-1200px">
    <img class="w-400px" src={images.voting_hands} alt="governance mining"/>
    <div class="font-hero font-hero-sim">Get paid for<br />Governaning</div>
    <!-- <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a> -->
    <div class="text-lg font-thin mx-4 md:mx-10pc mt-8 mb-8">
      A complete redesign of the governance system with token holders in mind: go vote on key DAO matters & get a paycheck for your work,
      every month.
    </div>

    <div class="flex flex-col items-center text-center mt-20 m-5">
      <img class="w-300px -mb-50px z-50" src={images.d_top} alt="dollar-in"/>
    <div class="w-full max-w-1200px">
      <div class="bg-peppermint rounded py-20 px-12">
        <div class="font-bold text-xl">We stand by our products</div>
        <div class="flex text-justify font-thin mt-4">
          <div class="w-1/2 mr-4">Our products do what it says on the tin: diversify your portfolio and make you money. That is why we propose to actively manage our own treasury, generating more revenues on liquidity pools across Balancer, Uniswap, Curve, and Sushiswap.</div>
          <div class="w-1/2 ml-4">The better the Pies perform, the more funds in the treasury.The more funds in the treasury, the more profits derived from Treasury Farming. Where do these profits go?</div>
        </div>
      </div>
    </div>
      <img class="w-300px -mt-50px z-50" src={images.d_bottom} alt="dollar-out"/>
    </div>

    <div class="flex flex-col items-center text-center mt-8">
      <div class="w-full flex flex-col items-center px-8 max-w-1200px">
        <img class="w-600px" src={images.intro_gov_mining} alt="governance mining"/>
        <div class="text-xl font-bold mt-4 mb-4">Introducing</div>
        <div class="font-hero font-hero-sim">Governance<br />Mining</div>
        <!-- <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a> -->
        <div class="text-lg font-thin text-justify mx-4 md:mx-10pc mt-8 mb-8">
          The DAO’s profits should go to those who put the hard work of driving this wealth creation machine forward: <strong>active governance members.</strong>
          <br /><br />Should PIP-XX pass the community vote, only staked DOUGH (veDOUGH) would be used for governance votes: this means no free-riding, no swaying votes for short-term gain, and true long-term alignment for the future of PieDAO.
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center text-center mt-20">
    <div class="w-full max-w-1200px">
      <div class="bg-melanzanafritta min-h-300px flex items-center text-white rounded py-12 px-12">
        <img class="w-180px h-180px md:mr-12" src={images.newblack} alt="vedough is the new black"/>
        <div class="text-justify font-thin">
          <div class="font-bold text-xl">veDOUGH Is The New Black</div>
          <div class="">Any DOUGH holder can choose to stake, selecting a time period and amount to stake, which will determine their voting power and their share of the DAO profits. This completely transforms DOUGH value accrual, putting a buy & hold pressure as a source of cashflows.
            <br /><br />Active veDOUGH holders will get 60% (!) of the DAO profits, while 25% will be used to compound the treasury and 15% - allocated for development costs.
            </div>
        </div>
      </div>
    </div>
    </div>

    <div class="w-full flex flex-col items-center text-center mt-20 m-5">
      <div class="w-full max-w-1200px flex">
        <div class="mr-4 flex flex-col items-center drowpdown-shadow rounded p-12">
          <img class="w-180px h-180px" src={images.ecosystem_friendly} alt="vedough is the new black"/>
          <div class="text-xl leading-12 mt-4">Synergistic To The<br />DeFi Ecosystem</div>
          <div class="font-base font-thin text-justify mt-4">PieDAO lies at the heart of the DeFi ecosystem, and we want it to thrive. That is why we won't be selling our farmed tokens for other assets to distribute to $DOUGH holders - we will distribute what we farm, all nicely packed together in our special RewardsPie.</div>
        </div>
        <div class="ml-4 flex flex-col items-center drowpdown-shadow rounded p-12">
          <img class="w-180px h-180px" src={images.duck} alt="vedough is the new black"/>
          <div class="text-xl leading-12 mt-4">Who calls the<br />Shots?</div>
          <div class="font-base font-thin text-justify mt-4">A specially designated Treasury Committee is being formed, whose main tasks will be ensuring sufficiently diversified allocation of assets, the decision making on farming strategies to ensure consistent returns to token holders, and finally, bringing the DAO to self-sustainability.</div>
        </div>
      </div>
    </div>
    

    <div class="flex flex-col items-center text-center mt-20">
      <div class="w-full max-w-1200px">
        <div class="bg-melanzana min-h-300px flex items-center text-white rounded py-12 px-12">
          <img class="w-180px h-180px md:mr-12" src={images.costumeparty} alt="members"/>
          <div class="text-justify font-thin">
            <div class="font-bold text-xl">Anyone Can Become A Governance Member</div>
            <div class="">Governing PieDAO is about commitment and genuine passion for the mission - not the size of your wallet to cover those gas fees for votes. 
              <br /><br />To ensure inclusivity, we introduced optimistic execution design, where members can vote gas-free on Snapshot, and results are submitted on-chain.
              </div>
          </div>
        </div>
      </div>
      </div>


    <div class="font-huge mt-12">How it works</div>
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
        <div class="font-thin md:text-xs mb-4 text-left">
          <span class="float-left">Treasury Liquidity Deployed</span>
          <img
          on:click={() => openModal('simulator.treasury.liquidity.deployed')}
          class="token-icon w-18px h-18px pl-4px"
          src={images.simulator_info}
          alt="ETH"
        />
        </div>
        <div class="w-100pc font-veryhuge tracking-tight text-left mb-4">{formatBigMoneyAmount(markets.treasuryLiquidity.amount)}</div>
        <div class="font-bold leading-2 text-left mb-4">{markets.treasuryLiquidity.eth_value} ETH</div>
      </div>

      <div class=" bg-lightgrey rounded text-black p-8 flex flex-1 flex-col md:flex-row items-left">
        <div class="w-full md:w-2/3">
          <div class="font-thin md:text-xs mb-8 text-left">
            <span class="float-left">Rewards Distrubutions</span>
            <img
            on:click={() => openModal('simulator.rewards.distribution')}
            class="token-icon w-18px h-18px pl-4px"
            src={images.simulator_info}
            alt="ETH"
          />            
          </div>
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
          <div class="md:text-xs font-thin mb-4 text-left">
            <span class="float-left">Total veDOUGH</span>
            <img
            on:click={() => openModal('simulator.total.staked.ve.dough')}
            class="token-icon w-18px h-18px pl-4px"
            src={images.simulator_info}
            alt="ETH"
          />
          </div>
          <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
            <div class="flex nowrap items-center p-1" on:click={() => sliderModal.open()}>
              <input
                disabled
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="string"
                pattern="^[0-9]*[.,]?[0-9]*$"
                minlength="1"
                maxlength="16"
                spellcheck="false"
                placeholder={inputs.stakedVeDough}
                bind:value={inputs.stakedVeDough}
                on:keyup={calculate}
                on:change={format}
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
        <div class="flex flex-col w-full md:w-2/6 md:mr-8">
          <div class="md:text-xs font-thin text-left">
            <span class="float-left">Total Staking Commitment</span>
            <img
            on:click={() => openModal('simulator.total.staking.commitment')}
              class="token-icon w-18px h-18px pl-4px"
              src={images.simulator_info}
              alt="ETH"
            />
          </div>
          <div on:click={() => sliderModal.open()} class="flex pt-2 md:pt-7 mb-8 md:mb-0 justify-between">
            <div class="flex flex-col justify-between w-2/3">
              {#each rewards as reward}
              <div class="flex h-18px">
                <div style={`width: ${20 * (reward.percentage/100)}rem`} class="mt-8px percentage-bar bg-black h-2 roundedxs">       
                </div>
              </div>
            {/each}
            </div>
            <div class="w-1/3 pl-2">
              {#each rewards as reward}
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
          <div class="md:text-xs font-thin mb-4 text-left">
            <span class="float-left">Expected Treasury APR</span>
            <img
            on:click={() => openModal('simulator.expected.apr')}
              class="token-icon w-18px h-18px pl-4px"
              src={images.simulator_info}
              alt="ETH"
            />
          </div>
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
                on:change={format}
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
          <div class="md:text-xs font-thin mb-4 text-left">
            <span class="float-left">Rewards Unclaimed</span>
            <img
            on:click={() => openModal('simulator.rewards.unclaimed')}
              class="token-icon w-18px h-18px pl-4px"
              src={images.simulator_info}
              alt="ETH"
            />
          </div>
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
                on:change={format}
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
      <div class="w-full bg-lightgrey rounded text-black mb-2 p-8 flex flex-col">
        <div class="w-full flex flex-col md:flex-row">
          <div class="w-full md:w-2/4 md:mr-8">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Your Staked DOUGH</span>
              <img
              on:click={() => openModal('simulator.your.staked.dough')}
                class="token-icon w-18px h-18px pl-4px"
                src={images.simulator_info}
                alt="ETH"
              />
            </div>
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8">
              <div class="flex nowrap items-center p-1">
                <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="string"
                pattern="^[0-9]*[.,]?[0-9]*$"
                minlength="1"
                maxlength="16"
                spellcheck="false"
                placeholder={inputs.stakedDough}
                bind:value={inputs.stakedDough}
                on:keyup={calculate}
                on:change={format}
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
          <div class="w-full md:w-2/4 md:mr-8">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Your Staking Commitment</span>
              <img
              on:click={() => openModal('simulator.your.staking.commitment')}
                class="token-icon w-18px h-18px pl-4px"
                src={images.simulator_info}
                alt="ETH"
              />
            </div>  
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-14px bg-white mb-8 md:mt-8">
              <div class="flex nowrap items-center">
                <input
                class="swap-input-from"
                inputmode="decimal"
                autocomplete="off"
                autocorrect="off"
                type="string"
                pattern="^[0-9]*[.,]?[0-9]*$"
                minlength="1"
                maxlength="16"
                spellcheck="false"
                placeholder={inputs.commitment}
                bind:value={inputs.commitment}
                on:keyup={calculate}
                on:change={format}
                />
                <div class="flex items-center cardbordergradient" on:click={() => setCommitment(36)}>
                  <div class="flex items-center p-2">
                    <div class=" mr-8px">3 Years</div>
                    <img
                      class="w-30px h-30px"
                      src={images.simulator_hands}
                      alt="ETH"
                    />
                  </div>
                </div>
              </div>
            </div>              
            <!--
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
            -->
          </div>
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

    <div class="flex flex-row gap-2 mb-2">
      <div class="w-full bg-lightgrey rounded text-black mb-2 p-8 flex flex-col">
        <div class="w-full flex flex-col md:flex-row">
          <div class="w-full md:w-2/4 md:mr-8">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Name Yourself</span>
            </div>
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-14px bg-white mb-8 md:mt-8">
              <div class="flex nowrap items-center">
                <input
                class="swap-input-from"
                inputmode="text"
                autocomplete="off"
                autocorrect="off"
                type="string"
                spellcheck="false"
                placeholder={simulation.author}
                bind:value={simulation.author}
                on:keyup={simulationChanged = true}
                />
              </div>
            </div>                 
          </div>
          <div class="w-full md:w-2/4 md:mr-8">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Name Your Simulation</span>
            </div>  
            <div class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-14px bg-white mb-8 md:mt-8">
              <div class="flex nowrap items-center">
                <input
                class="swap-input-from"
                inputmode="text"
                autocomplete="off"
                autocorrect="off"
                type="string"
                spellcheck="false"
                placeholder={simulation.name}
                bind:value={simulation.name}
                on:keyup={simulationChanged = true}
                />
              </div>
            </div>
          </div>
        </div> 
        <div class="flex flex-col md:flex-row items-center mt-8 border-t-1 border-gray-50 pt-4">
          <button 
          on:click={() => getPermalink()}
          class="w-full btnbig text-white m-4 rounded-8px p-15px">
          {#if permalink_url}
            {#if simulationChanged}
              Update Your Simulation
            {:else}
              <a target="_blank" href={permalink_url}>
                Your Simulation link is: {permalink_url}
              </a>
            {/if}
          {:else}
            Save your simulation, get a permalink!
          {/if}
        </button>
        </div>
      </div>      
    </div>

    <!-- CHARTS SECTION -->
    {#key projections}
      <Tabs tabs={tabs} projections={projections}/>
    {/key}
  </div>
</div>