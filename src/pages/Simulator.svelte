<script>
  import { Simulator } from '../classes/farming_simulator/Simulator.js';

  let simulator = new Simulator();

  simulator.calculate(100000, "36M", 10, 4500000, 50).then(response => {
    console.log(response);
  }).catch(error => console.error(error));
</script>

<div class="content flex flex-col">
  contents will go in here soon...
</div>