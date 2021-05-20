import { Calculator } from './Calculator.js';

export class Simulator {

  constructor() {
    // inputs variables, passed by the simulator inputs form,
    // at first refilled with defaults values...
    this.inputs = {
      STAKED_DOUGH: 100000,
      COMMITMENT: "36M",
      REWARDS_UNCLAIMED: 10,
      STAKED_VEDOUGH: 4500000,
      EXPECTED_APR: 50
    };

    // instance of the Calculator class...
    this.calculator = new Calculator();
  }

  calculate(inputs) {
    return new Promise((resolve, reject) => {            
      this.calculator.calculate(inputs).then(response => {
        resolve(response);
      }).catch(error => reject(error));
    });
  }

  retrieveMarkets() {
    return new Promise((resolve, reject) => {            
      this.calculator.initMarkets().then(markets => {
        resolve(markets);
      }).catch(error => reject(error));
    });
  }
}