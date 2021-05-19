import CoinGecko from 'coingecko-api';

export class Calculator {

  constructor() {
    // goingecko API...
    this.coingecko_api = new CoinGecko();

    // default treasury address, just a placeholder for now
    // TODO: change it for real address before go live...
    this.treasury_address = "0x78f225869c08d478c34e5f645d07a87d3fe8eb78";

    // default empty markets object, to be filled dynamically...
    this.markets = {
      // toggle variable to check if markets is initialized or not...
      INITIALIZED: false,
      // treasury liquidity infos...
      TREASURY_LIQUIDITY_DEPLOYED: {
        MARKET_CAP: 0,
        TOTAL_SUPPLY: 0,
        CIRC_SUPPLY: 0,
        TOTAL_VOLUME: 0
      },
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
      USD: {},
      "6M": {"$": {}, "%": {}},
      "12M": {"$": {}, "%": {}},
      "24M": {"$": {}, "%": {}},
      "36M": {"$": {}, "%": {}},
    };

    // total returns in $ and %...
    this.returns = {
      "6M": {"$": 0, "%": 0},
      "12M": {"$": 0, "%": 0},
      "24M": {"$": 0, "%": 0},
      "36M": {"$": 0, "%": 0},
    }

    // default rewards object...
    this.rewards = {
      distributed: 60,
      compound: 25,
      costs: 15
    };    

    // default commitment multipliers...
    this.commitment_multipliers = {
      "6M": 0.08333333333,
      "12M": 0.2311421345,
      "24M": 0.5912352048,
      "36M": 1.00000000 
    };

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
          let dough_response = await this.coingecko_api.coins.fetch('piedao-dough-v2', {});
          let dough_market_data = dough_response.data.market_data;
    
          // retrieving the infos about Treasury from coingecko...
          let treasury_response = await this.coingecko_api.coins.fetchCoinContractInfo(this.treasury_address);
          let treasury_market_data = treasury_response.data.market_data;
          
          // saving the values we need inside our config object...
          this.markets.DOUGH.PRICE = dough_market_data.current_price.usd;
          this.markets.DOUGH.CIRC_SUPPLY = dough_market_data.circulating_supply;
          this.markets.DOUGH.MARKET_CAP = dough_market_data.market_cap.usd;

          this.markets.TREASURY_LIQUIDITY_DEPLOYED.MARKET_CAP = 5760405; //treasury_market_data.market_cap.usd;
          this.markets.TREASURY_LIQUIDITY_DEPLOYED.TOTAL_SUPPLY = treasury_market_data.total_supply;
          this.markets.TREASURY_LIQUIDITY_DEPLOYED.CIRC_SUPPLY = treasury_market_data.circulating_supply;
          this.markets.TREASURY_LIQUIDITY_DEPLOYED.TOTAL_VOLUME = treasury_market_data.total_volume.usd;

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
        let staked_capital = inputs.STAKED_DOUGH * this.markets.DOUGH.PRICE;
        let yearly_returns = staked_capital * this.returns[inputs.COMMITMENT]["$"];

        this.outputs.user = {
          EXPECTED_YEARLY_RETURNS: yearly_returns,
          EXPECTED_MONTHLY_RETURNS: yearly_returns / 12,
          EXPECTED_APR: this.returns[inputs.COMMITMENT]["%"]
        };

        // rounding the numbers of the returns object...
        this.roundNumbers(this.outputs, null, 2);

        resolve(this.outputs);
      }).catch(error => reject(error));
    });
  }

  project(inputs) {
    return new Promise(async(resolve, reject) => {
      this.initMarkets().then(() => {
        // calculating first month...
        let farming_asset = this.markets.TREASURY_LIQUIDITY_DEPLOYED.MARKET_CAP;

        this.projections.YEARLY[1] = farming_asset * (inputs.EXPECTED_APR / 100);
        this.projections.MONTHLY[1] = this.projections.YEARLY[1] / 12;

        // calculating the projections for the next 12 months...
        for(let i = 2; i < 14; i++) {
          // calculating the compound for the current month, considering previous returns...
          let compound = this.projections.MONTHLY[i - 1] * (this.rewards.compound / 100);
          
          // calculating the yearly/montly returns for the current month...
          farming_asset += compound; 
          this.projections.YEARLY[i] = farming_asset * (inputs.EXPECTED_APR / 100);
          this.projections.MONTHLY[i] = this.projections.YEARLY[i] / 12;
          this.projections.STAKING_REWARDS[i] = this.projections.MONTHLY[i] * (this.rewards.distributed / 100);

          this.projections.USD[i] = this.projections.STAKING_REWARDS[i] / (inputs.STAKED_VEDOUGH * (1 - (inputs.REWARDS_UNCLAIMED / 100)));
          
          // calculating the relative commitment for each month...
          ["6M", "12M", "24M", "36M"].forEach(commitment => {
            this.projections[commitment]["$"][i] = this.projections.USD[i] * this.commitment_multipliers[commitment];
            this.projections[commitment]["%"][i] = (this.projections[commitment]["$"][i] / this.markets.DOUGH.PRICE) * 100;
            // calculating the totals for $ and % APR for each month's projection...
            this.returns[commitment]["$"] += this.projections[commitment]["$"][i];
            this.returns[commitment]["%"] += this.projections[commitment]["%"][i];
          });
 
        }

        // rounding the numbers of the projections object...
        this.roundNumbers(this.projections);
        // rounding the numbers of the returns object...
        this.roundNumbers(this.returns, null, 2);

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