<script>
  // importing the Simulator class...
  import Simulator from '../classes/farming_simulator/Simulator.js';
  // creating the Simulator class instance...
  let simulator = new Simulator();
  // filling the first default values...
  let inputs = {
    stakedDough: 100000,
    commitment: 36,
    rewardsUnclaimed: 10,
    stakedVeDough: 4500000,
    expectedApr: 50
  };
  // retrieving the markets infos...
  /*
  let markets = simulator.retrieveMarkets().then(markets => {
    console.log(markets);
  }).catch(error => console.error(error));
  */

  simulator.calculate(inputs).then(response => {
    console.log(response);
  }).catch(error => console.error(error));
</script>

<div class="content flex flex-col">
  contents will go in here soon...
</div>