<script>
  // importing the Simulator class...
  import Simulator from '../../classes/farming_simulator/Simulator.js';
  import { formatBigMoneyAmount } from '../../components/helpers.js';
  import images from '../../config/images.json';
  import displayNotification from '../../notifications';
  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
  import { formatFiat } from '../../components/helpers.js';
  import { currentRoute } from '../../stores/routes.js';
  import InfoModal from '../../components/modals/infoModal.svelte';
  import StakingStats from '../../components/staking/Stats.svelte';
  import StakingCommitmentModal from '../../components/modals/stakingCommitmentModal.svelte';
  import Modal from '../../components/elements/Modal.svelte';
  import confetti from '../../components/Confetti.js';
  import { fetchStakingStats, toNum } from '../../helpers/staking.js';
  import { eth } from '../../stores/eth.js';

  import Tab1 from './charts/Tab1.svelte';
  import Tab2 from './charts/Tab2.svelte';
  import Tab3 from './charts/Tab3.svelte';
  import Tabs from './charts/Tabs.svelte';

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
    Object.keys(inputs).forEach((key) => {
      switch (key) {
        case 'commitment':
          inputs[key] = inputs[key].replace(/[^0-9]/g, '');

          if (inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key] + ' Months';
          } else {
            inputs[key] += ' Months';
          }
          break;
        case 'stakedDough':
        case 'stakedVeDough':
          inputs[key] = parseFloat(inputs[key].replace(/[^0-9.]/g, ''));

          if (inputs[key] > max_values[key] || inputs[key] < 0) {
            inputs[key] = max_values[key];
          }

          inputs[key] = formatFiat(inputs[key], ',', '.', '');
          break;
        case 'rewardsUnclaimed':
        case 'expectedApr':
          inputs[key] = inputs[key].replace(/[^0-9]/g, '');

          if (inputs[key] > max_values[key] || inputs[key] < 0) {
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
    simulator
      .calculate(inputs)
      .then((response) => {
        simulationChanged = changed;

        outputs = response.outputs;
        projections = response.breakdowns;

        tabs = [
          { label: 'Expected Tot Returns', value: 1, component: Tab1 },
          { label: 'Farmed Treasury', value: 2, component: Tab2 },
          { label: 'Reward Distributions', value: 3, component: Tab3 },
        ];

        isLoading = false;
      })
      .catch((error) => console.error(error));
  }

  function openModal(content_key) {
    modal_content_key = content_key;
    modal.open();
  }

  // variables...
  let modal;
  let sliderModal;
  let modal_content_key;
  let estimated_dough_value;
  let isLoading = true;
  let isLoadingText = 'loading data';

  setInterval(() => {
    let occurrences = isLoadingText.split('.').length - 1;

    if (occurrences < 3) {
      isLoadingText += '.';
    } else {
      isLoadingText = 'loading data';
    }
  }, 500);

  // creating the Simulator class instance...
  let simulator = new Simulator();

  // defining maximum values for input fields...
  let max_values = {
    commitment: 36,
    rewardsUnclaimed: 100,
    stakedVeDough: 15000000,
    expectedApr: 100,
  };

  // filling the first default values...
  let inputs = {
    stakedDough: formatFiat(100000, ',', '.', ''),
    commitment: '36 Months',
    rewardsUnclaimed: '10%',
    stakedVeDough: 0,
    expectedApr: '19%',
  };

  // rewards distrubutions, hardcoded for now...
  let rewards = [
    { commitment: '6 Months', months: 6, percentage: 1 },
    { commitment: '1 Year', months: 12, percentage: 1 },
    { commitment: '2 Years', months: 24, percentage: 1 },
    { commitment: '3 Years', months: 36, percentage: 97 },
  ];

  // retrieving default markets infos...
  let markets = simulator.getMarkets();

  // fetching real market infos...
  simulator.retrieveMarkets().then(async (response) => {
    markets = response;
    let stakingStats = await fetchStakingStats($eth.provider, 1);
    estimated_dough_value = toNum(stakingStats.totalStakedDough);

    if (!$currentRoute.params.simulation) {
      let stakedVeDough = 0;

      rewards.forEach((reward) => {
        let stakedDoughPercentage = estimated_dough_value * (reward.percentage / 100);
        stakedVeDough += simulator.calculator.calculateVeDough(
          stakedDoughPercentage,
          reward.months,
        );
      });

      inputs.stakedVeDough = formatFiat(stakedVeDough, ',', '.', '');

      calculate(false);
    } else {
      loadSimulation();
    }
  });

  // retrieving default outputs object...
  let outputs = simulator.getOutputs();
  let projections = simulator.getProjections();

  // List of tab items with labels, values and assigned components
  let tabs = [];

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

  let permalink_url = null;
  let simulationChanged = false;
  let simulation = {
    name: '',
    author: '',
  };

  const config = {
    angle: 180,
    spread: 360,
    startVelocity: 40,
    elementCount: 40,
    dragFriction: 0.12,
    duration: 8000,
    stagger: 3,
    width: '30px',
    height: '56px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  const button = document.querySelector('#confetti');
  confetti(button, config);
</script>

<Modal backgroundColor="#f3f3f3" bind:this={modal}>
  <span slot="content">
    <InfoModal description_key={modal_content_key} />
  </span>
</Modal>

<Modal backgroundColor="#f3f3f3" bind:this={sliderModal}>
  <span slot="content">
    <StakingCommitmentModal
      {rewards}
      {estimated_dough_value}
      dough_circulation_supply={markets.dough.circSupply}
      on:applyConfig={updateSimulator}
    />
  </span>
</Modal>

<div id="confetti" class="hidden md:block" />

<div class="flex flex-col items-center text-center mt-8">
  <div class="w-full flex flex-col items-center px-4 md:px-8 max-w-1200px">
    <img class="w-400px" src={images.voting_hands} alt="governance mining" />
    <div class="font-hero font-hero-sim">Get paid for<br />Governing</div>
    <!-- <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a> -->
    <div class="text-l md:text-lg font-thin mx-4 md:mx-10pc mt-4 md:mt-8 mb-8">
      A complete redesign of the governance system with token holders in mind: vote on key DAO
      matters and get compensated for your work every month.
    </div>

    <button
      onclick="location.href='/#/dough-staking';"
      class="btnbig mt-0 text-white rounded-8px p-15px"
    >
      Stake DOUGH
    </button>

    <div class="flex flex-col items-center text-center mt-12 md:mt-20">
      <img class="w-300px -mb-50px z-50" src={images.d_top} alt="dollar-in" />
      <div class="w-full max-w-1200px">
        <div class="bg-peppermint rounded py-20 px-12">
          <div class="font-bold text-xl leading-12">We stand by our products</div>
          <div class="flex flex-col md:flex-row text-justify font-thin mt-4">
            <div class="md:w-1/2 md:mr-4">
              Our products do what they say on the tin: diversify your portfolio and make you money.
              That is why we propose to actively manage our own
            </div>
            <div class="md:w-1/2 md:ml-4 mt-4 md:mt-0">
              treasury, generating more revenue from liquidity pools across Balancer, Uniswap,
              Curve, and Sushiswap.
            </div>
          </div>
        </div>
      </div>
      <img class="w-300px -mt-50px z-50" src={images.d_bottom} alt="dollar-out" />
    </div>

    <div class="flex flex-col items-center text-center mt-8">
      <div class="w-full flex flex-col items-center px-8 max-w-1200px">
        <img class="w-600px" src={images.intro_gov_mining} alt="governance mining" />
        <div class="text-xl font-bold mt-4 mb-4">Introducing</div>
        <div class="font-hero font-hero-sim">Governance<br />Mining</div>
        <!-- <a href="#/placeholder" data-aos="fade-up" data-aos-delay="500"><button class="btnbig text-white m-0 my-8 rounded-8px p-15px min-w-200px w-100pc lg:w-200px lg:min-w-200px">Earn up to 45% APY</button></a> -->
        <div class="text-l md:text-lg font-thin text-justify mx-4 md:mx-10pc mt-8 mb-8">
          We believe that DAO profits should go to those who put in the hard work of driving this
          wealth creation machine forward: <strong>active governance members.</strong>
          <br /><br />Should PIP-60 pass the community vote, only staked DOUGH (veDOUGH) will be
          used for governance votes. This means no free-riding, no swaying votes for short-term
          gain, and true long-term alignment for the future of PieDAO.
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center text-center mt-6 md:mt-20">
      <div class="w-full max-w-1200px">
        <div
          class="bg-melanzanafritta min-h-300px flex flex-col md:flex-row items-center text-white rounded py-12 px-12"
        >
          <img
            class="w-180px h-180px md:mr-12"
            src={images.newblack}
            alt="vedough is the new black"
          />
          <div class="font-thin">
            <div class="font-bold text-l md:text-xl text-center md:text-left mt-4 md:mt-0">
              veDOUGH Is The New Black
            </div>
            <div class="text-justify mt-4 md:mt-0">
              Any DOUGH holder can choose to stake. The selected staking period and token amount
              will determine a user’s voting power and share of DAO profits. This completely
              transforms DOUGH value accrual, creating a buy and hold pressure as a source of cash
              flows.
              <br /><br />Active veDOUGH holders will get 60% (!) of DAO profits, while 25% will be
              used to compound the treasury and 15% will be allocated to development costs.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col items-center text-center mt-4 md:mt-20">
      <div class="w-full max-w-1200px flex flex-col md:flex-row">
        <div class="md:mr-4 flex flex-col items-center border-grey rounded p-12">
          <img
            class="w-180px h-180px"
            src={images.ecosystem_friendly}
            alt="vedough is the new black"
          />
          <div class="text-l md:text-xl md:leading-12 mt-4">
            Synergistic To The<br class="hidden md:block" />DeFi Ecosystem
          </div>
          <div class="font-base font-thin text-justify mt-4">
            PieDAO lies at the heart of the DeFi ecosystem, and we want it to thrive. This is why we
            will not be selling our farmed tokens for other assets to distribute to DOUGH holders -
            we will distribute what we farm, all nicely packed together in our special RewardsPie.
          </div>
        </div>
        <div class="mt-4 md:mt-0 md:ml-4 flex flex-col items-center border-grey rounded p-12">
          <img class="w-180px h-180px" src={images.duck} alt="vedough is the new black" />
          <div class="text-l md:text-xl md:leading-12 mt-4">
            Who calls the<br class="hidden md:block" />Shots?
          </div>
          <div class="font-base font-thin text-justify mt-4">
            A specially designated Treasury Committee is being formed, whose main tasks will be
            ensuring sufficiently diversified allocation of assets, determining farming strategies
            to establish consistent returns to token holders, and bringing the DAO to
            self-sustainability.
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center text-center mt-4 md:mt-20">
      <div class="w-full max-w-1200px">
        <div
          class="bg-melanzana min-h-300px flex flex-col md:flex-row items-center text-white rounded py-12 px-12"
        >
          <img class="w-180px h-180px md:mr-12" src={images.costumeparty} alt="members" />
          <div class="font-thin">
            <div class="font-bold text-l md:text-xl text-center md:text-left mt-4 md:mt-0">
              Anyone Can Become A Governance Member
            </div>
            <div class="text-justify mt-4 md:mt-0">
              Governing PieDAO is about commitment and genuine passion for the mission - not the
              size of your wallet to cover the gas fees for votes.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="font-huge mt-12 hidden md:block">How it works</div>
    <div class="hidden md:block">
      <LottiePlayer
        src="https://assets10.lottiefiles.com/private_files/lf30_wksf88hl.json"
        autoplay={true}
        loop={true}
        controls={false}
        renderer="svg"
        background="white"
        height=""
        width="100%"
        {controlsLayout}
      />
    </div>
  </div>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-20">
  <div class="w-full max-w-1240px"><StakingStats /></div>
</div>

<div class="w-full flex justify-center">
  <button
    onclick="location.href='/#/dough-staking';"
    class="btnbig mt-8 text-white rounded-8px p-15px"
  >
    Stake DOUGH
  </button>
</div>

<div class="flex flex-col items-center text-center mt-4 md:mt-10">
  <div class="w-full max-w-1200px h-100pc">
    <div class="font-huge">Rewards Simulator</div>
    <div class="text-base font-thin mx-4 md:mx-20pc mb-8">
      Tweak the parameters. We built these tools so you can play being rich until you finally buy
      DOUGH and become rich for real.
    </div>

    {#if isLoading}
      <div
        class="flex justify-center items-center max-w-1200px w-100pc mt-20"
        style="position:absolute;"
      >
        <div class="bg-transparent flex flex-col justify-center z-40">
          <div class="rounded bg-transparent text-black z-50 p-20">{isLoadingText}</div>
        </div>
      </div>
    {/if}

    <div class={isLoading ? 'flex flex-col opacity-10' : 'flex flex-col'}>
      <!-- FIRST FLEX ROW - TREASURY AND DISTRIBUTIONS -->
      <div class="flex flex-col md:flex-row gap-2 mb-2">
        <div
          class="w-92pc mx-4 md:w-1/3 md:mx-0 bg-lightgrey rounded text-black p-8 flex flex-shrink-0 flex-col items-left"
        >
          <div class="font-thin md:text-xs mb-4 text-left">
            <span class="float-left">Treasury Liquidity Deployed</span>
            <img
              on:click={() => openModal('simulator.treasury.liquidity.deployed')}
              class="token-icon w-18px h-18px pl-4px"
              src={images.simulator_info}
              alt="ETH"
            />
          </div>
          <div class="w-100pc font-huge md:font-veryhuge tracking-tight text-left mb-4">
            {formatBigMoneyAmount(markets.treasuryLiquidity.amount)}
          </div>
          <div class="font-bold leading-2 text-left mb-4">
            {markets.treasuryLiquidity.eth_value} ETH
          </div>
        </div>

        <div
          class="w-92pc mx-4 md:w-full md:mx-0 bg-lightgrey rounded text-black p-8 flex flex-1 flex-col md:flex-row items-left"
        >
          <div class="w-full md:w-2/3">
            <div class="font-thin md:text-xs mb-8 text-left">
              <span class="float-left">Rewards Distributions</span>
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
                <button style="background-color: #24D897;" class="ml-4 oven-withdraw-button"
                  >60%</button
                >
              </div>
            </div>
            <div class="w-full">
              <div class="font-bold mb-2 text-xs md:text-base py-1px text-left align-left rounded">
                Used to compound the treasury
                <button style="background-color: #CF4EB7;" class="ml-4 oven-withdraw-button"
                  >25%</button
                >
              </div>
            </div>
            <div class="w-full">
              <div class="font-bold mb-2 text-xs md:text-base py-1px text-left align-left rounded">
                Used to cover costs
                <button style="background-color: #67BDF0;" class="ml-4 oven-withdraw-button"
                  >15%</button
                >
              </div>
            </div>
          </div>

          <div class="w-full md:w-1/3 align-center hidden md:block">
            <img class="token-icon w-180px" src={images.simulator_chart} alt="ETH" />
          </div>
        </div>
      </div>
      <!-- SECOND FLEX ROW - TOTAL STAKED veDOUGH | REWARDS | APR -->
      <div
        class="w-92pc mx-4 md:w-full md:mx-0 bg-lightgrey rounded text-black mb-2 p-8 flex flex-col"
      >
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
            <div
              class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8"
            >
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
                  <img class="token-icon w-30px h-30px" src={images.veDough} alt="ETH" />
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
            <div
              on:click={() => sliderModal.open()}
              class="flex pt-2 md:pt-7 mb-8 md:mb-0 justify-between"
            >
              <div class="flex flex-col justify-between w-1/2 md:w-2/3">
                {#each rewards as reward}
                  <div class="flex h-18px">
                    <div
                      style={`width: ${18 * (reward.percentage / 100)}rem`}
                      class="mt-8px percentage-bar bg-black h-2 roundedxs"
                    />
                  </div>
                {/each}
              </div>
              <div class="w-full md:w-1/3 md:pl-2">
                {#each rewards as reward}
                  <div class="md:text-xs font-thin text-right h-18px">
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
            <div
              class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8"
            >
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
                  <img class="token-icon w-30px h-30px" src={images.simulator_launch} alt="ETH" />
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
            <div
              class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8"
            >
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
                  <img class="token-icon w-30px h-30px" src={images.simulator_sword} alt="ETH" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- THIRD FLEX ROW - YOUR STAKED DOUGH | COMMITMENT -->
      <div
        class="w-92pc mx-4 md:w-full md:mx-0 bg-lightgrey rounded text-black mb-2 p-8 flex flex-col"
      >
        <div class="w-full flex flex-col md:flex-row">
          <div class="w-full md:w-1/2 md:mr-4">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Your Staked DOUGH</span>
              <img
                on:click={() => openModal('simulator.your.staked.dough')}
                class="token-icon w-18px h-18px pl-4px"
                src={images.simulator_info}
                alt="ETH"
              />
            </div>
            <div
              class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-16px bg-white mb-8 md:mt-8"
            >
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
                  <img class="token-icon w-30px h-30px" src={images.doughtoken} alt="ETH" />
                  <div class="py-2px px-4px">DOUGH</div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:w-1/2 md:ml-4">
            <div class="w-full font-thin text-left md:text-xs mb-4">
              <span class="float-left">Your Staking Commitment</span>
              <img
                on:click={() => openModal('simulator.your.staking.commitment')}
                class="token-icon w-18px h-18px pl-4px"
                src={images.simulator_info}
                alt="ETH"
              />
            </div>
            <div
              class="flex flex-col nowrap w-100pc swap-from border rounded-20px border-grey p-14px bg-white mb-8 md:mt-8"
            >
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
                <div
                  class="flex items-center cardbordergradient"
                  on:click={() => setCommitment(36)}
                >
                  <div class="flex items-center p-2">
                    <div class=" mr-8px">3 Years</div>
                    <img class="w-30px h-30px" src={images.simulator_hands} alt="ETH" />
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
        <div class="flex flex-col md:flex-row items-center mt-4 border-t-1 border-gray-50 pt-4">
          <div class="md:h-32px flex items-center">
            <div class="md:text-xs leading-3 font-thin mr-2">You will receive:</div>
            <div class="md:text-base mr-2">
              {outputs.user.expectedVeDough}
            </div>
            <img class="token-icon w-30px h-30px" src={images.veDough} alt="ETH" />
            <div class="px-4px font-thin">veDOUGH</div>
          </div>
          <div class="font-thin mx-6 hidden md:block">|</div>
          <div class="md:text-xs mt-2 md:mt-0 font-thin">
            For 3 years commitment: 1 DOUGH = 1 veDOUGH
          </div>
        </div>
      </div>
      <!-- FOURTH FLEX ROW - SUMMARY -->
      <div class="flex flex-row gap-2 mb-2">
        <div
          class="w-92pc mx-4 md:w-full md:mx-0 bg-lightgrey  rounded text-black p-8 flex flex-auto flex-col items-left"
        >
          <div class="font-huge leading-2 mb-8 text-center">Summary</div>
          <div class="flex flex-col md:flex-row pb-4">
            <div class="flex-initial w-full md:w-1/3">
              <div class="font-thin">Your Expected Returns (Yearly)</div>
              <div class="md:text-base mb-4 mt-2">
                {formatFiat(outputs.user.expectedYearlyReturns)}
              </div>
            </div>
            <div class="flex-initial w-full md:w-1/3 mt-2 md:mt-0">
              <div class="font-thin">Your Expected Returns (Monthly)</div>
              <div class="md:text-base mb-4  mt-2">
                {formatFiat(outputs.user.expectedAverageMontlyReturns)}
              </div>
            </div>
            <div class="flex-initial w-full md:w-1/3 mt-2 md:mt-0">
              <div class="font-thin">Your Expected APR</div>
              <div class="md:text-base mb-4 mt-2">{outputs.user.expectedApr}%</div>
            </div>
          </div>
          <div class="flex flex-col md:flex-row pt-4 border-t-1 border-gray-50">
            <div class="flex-initial w-full md:w-1/3 mt-4">
              <div class="font-thin">Treasury Expected Returns (Yearly)</div>
              <div class="md:text-base mb-4 mt-2">
                {formatFiat(outputs.treasury.expectedYearlyReturns)}
              </div>
            </div>
            <div class="flex-initialw-full md:w-1/3 mt-4">
              <div class="font-thin">Treasury Expected Returns (Monthly)</div>
              <div class="md:text-base mb-4 mt-2">
                {formatFiat(outputs.treasury.expectedAverageMontlyReturns)}
              </div>
            </div>

            <div class="w-full md:w-1/3 mt-4">
              <div class="font-thin">Tot veDOUGH (Yours + Others)</div>
              <div class="flex items-center justify-center w-full mt-2">
                <div class="mr-2">{formatFiat(projections.median.farming.totalStakedVeDough)}</div>
                <img class="token-icon w-30px h-30px" src={images.veDough} alt="ETH" />
                <div class="px-4px font-thin">veDOUGH</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- CHARTS SECTION -->
      <div class="w-92pc mx-4 md:w-full md:mx-0">
        {#key projections}
          <Tabs {tabs} {projections} />
        {/key}
      </div>

    </div>
  </div>
</div>
