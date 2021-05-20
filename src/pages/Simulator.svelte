<script>
  // importing the Simulator class...
  import { Simulator } from '../classes/farming_simulator/Simulator.js';
  // creating the Simulator class instance...
  let simulator = new Simulator();
  // filling the first default values...
  let inputs = {
    STAKED_DOUGH: 100000,
    COMMITMENT: "36M",
    REWARDS_UNCLAIMED: 10,
    STAKED_VEDOUGH: 4500000,
    EXPECTED_APR: 50
  };
  // retrieving the markets infos...
  let markets = simulator.retrieveMarkets().then(markets => {
    console.log(markets);
  }).catch(error => console.error(error));

  simulator.calculate(inputs).then(response => {
    console.log(response);
  }).catch(error => console.error(error));
</script>

<div class="content flex flex-col">
  contents will go in here soon...
</div>