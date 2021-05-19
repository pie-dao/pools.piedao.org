import { Simulator } from './Simulator.js';

let simulator = new Simulator();

simulator.calculate(100000, "36M", 10, 4500000, 50).then(response => {
  console.dir(response, { depth: null })
}).catch(error => console.error(error));