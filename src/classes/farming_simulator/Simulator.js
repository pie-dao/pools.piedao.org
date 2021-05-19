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

  calculate(staked_dough, commitment, rewards_unclaimed, staked_vedough, expected_apr) {
    return new Promise((resolve, reject) => {
      this.inputs = {
        STAKED_DOUGH: staked_dough,
        COMMITMENT: commitment,
        REWARDS_UNCLAIMED: rewards_unclaimed,
        STAKED_VEDOUGH: staked_vedough ? staked_vedough : 4500000,
        EXPECTED_APR: expected_apr ? expected_apr : 50
      };
            
      this.calculator.calculate(this.inputs).then(response => {
        resolve(response);
      }).catch(error => reject(error));
    })
  }
}