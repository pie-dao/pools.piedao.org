import Calculator from './Calculator.js';

export default class Simulator {
  constructor() {
    // instance of the Calculator class...
    this.calculator = new Calculator();
    // final outputs...
    this.outputs = {
      treasury: {
        expectedYearlyReturns: 0,
        expectedMonthlyReturns: 0,
        expectedApr: 0,
      },
      user: {
        expectedYearlyReturns: 0,
        expectedMonthlyReturns: 0,
        expectedApr: 0,
        expectedVeDough: 0
      },
    };
  }

  calculate(inputs) {
    return new Promise((resolve, reject) => {
      this.calculator.calculate(inputs).then((response) => {
        resolve(response);
      }).catch((error) => reject(error));
    });
  }

  retrieveMarkets() {
    return new Promise((resolve, reject) => {
      this.calculator.initMarkets().then((markets) => {
        resolve(markets);
      }).catch((error) => reject(error));
    });
  }

  getMarkets() {
    return this.calculator.getMarkets();
  }

  getProjections() {
    return this.calculator.getProjections();
  }  

  getOutputs() {
    return this.outputs;
  }
}
