import Calculator from './Calculator.js';

export default class Simulator {
  constructor() {
    // instance of the Calculator class...
    this.calculator = new Calculator();
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
}
