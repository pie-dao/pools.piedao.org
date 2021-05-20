import { CoinGecko } from '../../stores/coingecko.js';

export class Calculator {

  constructor() {
    // default treasury address, just a placeholder for now
    // TODO: change it for real address before go live...
    this.treasury_address = "0x4efD8CEad66bb0fA64C8d53eBE65f31663199C6d";

    // default empty markets object, to be filled dynamically...
    this.markets = {
      // toggle variable to check if markets is initialized or not...
      INITIALIZED: false,
      // treasury liquidity infos...
      TREASURY_LIQUIDITY_DEPLOYED: 0,
      // dough-v2 infos...
      DOUGH: {
        PRICE: 0,
        CIRC_SUPPLY: 0,
        MARKET_CAP: 0
      }
    };

    // yearly/monthy treasury calculation...
    this.projections = {
      YEARLY: {},
      MONTHLY: {},
      STAKING_REWARDS: {},
      PER_VE_DOUGH: {},
      6: {"$": {}, "%": {}},
      12: {"$": {}, "%": {}},
      24: {"$": {}, "%": {}},
      36: {"$": {}, "%": {}},
    };

    // total returns in $ and %...
    this.returns = {
      6: {"$": 0, "%": 0},
      12: {"$": 0, "%": 0},
      24: {"$": 0, "%": 0},
      36: {"$": 0, "%": 0},
    }

    // default rewards object...
    this.rewards = {
      distributed: 60,
      compound: 25,
      costs: 15
    };    

    // default constant...
    this.k = 56.0268900276223;

    // final outputs...
    this.outputs = {
      treasury: {
        EXPECTED_YEARLY_RETURNS: 0,
        EXPECTED_MONTHLY_RETURNS: 0,
        EXPECTED_APR: 0
      },
      user: {
        EXPECTED_YEARLY_RETURNS: 0,
        EXPECTED_MONTHLY_RETURNS: 0,
        EXPECTED_APR: 0        
      }
    }     
  }

  initMarkets() {
    return new Promise(async (resolve, reject) => {
      // if the markets object is already initialized, we simply return it back
      // avoiding making too many requests to coingecko considering that on input-change event
      // we shall recalculate the final user's profits...
      if(this.markets.initialized) {
        resolve(this.markets);
      } else {
        try {
          // retrieving the infos about DOUGH from coingecko...
          let dough_response = await CoinGecko.fetchCoinData("piedao-dough-v2");
          let dough_market_data = dough_response.market_data;

          // saving the values we need inside our config object...
          this.markets.DOUGH.PRICE = 0.882686; // dough_market_data.current_price.usd;
          this.markets.DOUGH.CIRC_SUPPLY = dough_market_data.circulating_supply;
          this.markets.DOUGH.MARKET_CAP = dough_market_data.market_cap.usd;
          
          // retrieving the balance of Treasury from address...
          // TODO: remove the hardcoded number and use API (Zapper, Zerion)...
          this.markets.TREASURY_LIQUIDITY_DEPLOYED = 10000000;

          this.markets.INITIALIZED = true;
          resolve(this.markets);
    
          } catch(error) {
            reject(error);
          }        
      }
    });
  }

  calculate(inputs) {
    return new Promise(async (resolve, reject) => {
      this.project(inputs).then(() => {
        let user_yearly_returns = this.projections[inputs.COMMITMENT]["$"];
        let treasury_yearly_returns = this.projections.YEARLY[13] - this.markets.TREASURY_LIQUIDITY_DEPLOYED;

        this.outputs.user = {
          EXPECTED_YEARLY_RETURNS: user_yearly_returns,
          EXPECTED_MONTHLY_RETURNS: user_yearly_returns / 12,
          EXPECTED_APR: 0,
          EXPECTED_VEDOUGH: this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT)
        };

        this.outputs.treasury = {
          EXPECTED_YEARLY_RETURNS: treasury_yearly_returns,
          EXPECTED_MONTHLY_RETURNS: treasury_yearly_returns / 12,
          EXPECTED_APR: this.markets.TREASURY_LIQUIDITY_DEPLOYED / this.projections.MONTHLY[13]
        };        

        // rounding the numbers of the returns object...
        this.roundNumbers(this.outputs, null, 2);

        resolve(this.outputs);
      }).catch(error => reject(error));
    });
  }

  calculateVEDOUGH(staked_dough, commitment) {    
    return staked_dough * this.calculateCommitmentMultiplier(commitment);
  }

  calculateCommitmentMultiplier(commitment) {
    return commitment / this.k * Math.log10(commitment);
  }

  calculateCompound(index) {
    return this.projections.MONTHLY[index - 1] * (this.rewards.compound / 100);
  }

  _calculateCompound(value) {
    return value * (this.rewards.compound / 100);
  }

  project(inputs) {
    return new Promise(async(resolve, reject) => {
      this.initMarkets().then(() => {
        let farming_asset = this.markets.TREASURY_LIQUIDITY_DEPLOYED;

        // calculating first month...
        let expectedFarmingRewardsYearly = farming_asset * (inputs.EXPECTED_APR / 100);
        let expectedFarmingRewardsMonthly = startingFarmingRewardsYearly / 12;

        this.projections.YEARLY[1] = 0;
        this.projections.MONTHLY[1] = 0;

        // calculating the projections for the next 12 months...
        for(let i = 2; i < 14; i++) {
          // adding the montly compound into the farming asset...
          farming_asset += this._calculateCompound(expectedFarmingRewardsMonthly);
          
          // calculating the yearly/montly returns and the staking rewards for the current month...
          this.projections.YEARLY[i] = farming_asset * (inputs.EXPECTED_APR / 100);
          this.projections.MONTHLY[i] = this.projections.YEARLY[i] / 12;
          this.projections.STAKING_REWARDS[i] = this.projections.MONTHLY[i] * (this.rewards.distributed / 100);
          
          let total_staked_ve_dough = inputs.STAKED_VEDOUGH + this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT);
          this.projections.PER_VE_DOUGH[i] = this.projections.STAKING_REWARDS[i] / (total_staked_ve_dough * (1 - (inputs.REWARDS_UNCLAIMED / 100)));          

          this.projections[inputs.COMMITMENT]["$"][i] = this.projections.PER_VE_DOUGH[i] * this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT);
          this.projections[inputs.COMMITMENT]["%"][i] = (this.projections[inputs.COMMITMENT]["$"][i] / this.markets.DOUGH.PRICE) * 100;

          /*
          // for each compounded month, we calculate the scenario for the default commitments
          // those values can be used to show charts comparison for example...
          [inputs.COMMITMENT, 6, 12, 24, 36].forEach(commitment => {
            let temp_staked_ve_dough = inputs.STAKED_VEDOUGH + this.calculateVEDOUGH(inputs.STAKED_DOUGH, commitment);
            this.projections[commitment]["$"][i] = this.projections.PER_VE_DOUGH[i] * this.calculateCommitmentMultiplier(commitment);
            this.projections[commitment]["%"][i] = (this.projections[commitment]["$"][i] / this.markets.DOUGH.PRICE) * 100;
            // calculating the totals for $ and % APR for each month's projection...
            this.returns[commitment]["$"] += this.projections[commitment]["$"][i];
            this.returns[commitment]["%"] += this.projections[commitment]["%"][i];
          });
          */
        }
        console.log({projections: this.projections, returns: this.returns});
        resolve({projections: this.projections, returns: this.returns});
      }).catch(error => reject(error));      
    });
  }

  roundNumbers(returns, key = "root", decimals = 4) {
    Object.keys(returns).forEach(key => {
      if(typeof(returns[key]) == "object") {
        if(["YEARLY", "MONTHLY", "STAKING_REWARDS"].includes(key)) {
          this.roundNumbers(returns[key], key, 0);
        } else {
          if(key == "%") {
            this.roundNumbers(returns[key], key, 2);
          } else {
            this.roundNumbers(returns[key], key, decimals);
          }
        }
      } else {
        returns[key] = Number.parseFloat(returns[key]).toFixed(decimals);
      }
    });
  }
}