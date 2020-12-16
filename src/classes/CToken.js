import { ethers } from 'ethers';
import ABI from '../abis/cTokenABI.json';

class cToken {
  constructor(address, provider) {
    this.provider = provider;
    this.instance = new ethers.Contract(address, ABI, provider);
    this.apr = 0;
  }

  calculateApr(rateMantissa) {
    const expRate = rateMantissa * 1e18;
    const BLOCKS_PER_YEAR = 2102400;
    const APR = ((expRate * BLOCKS_PER_YEAR) / 1e18) * 100;
    this.apr = APR.toFixed(2);
    console.log('this.apr', this.apr);
    return this.apr;
  }

  async initialize() {
    try {
      const supplyRate = (await this.instance.functions.supplyRatePerBlock()) / 1e18;
      this.calculateApr(supplyRate);
    } catch (e) { console.log(e); }
  }
}

export default cToken;
