import { CoinGecko } from '../../stores/coingecko.js';

export class Calculator {

  constructor() {
    // default treasury address, just a placeholder for now
    // TODO: change it for real address before go live...
    this.treasury_address = "0x4efD8CEad66bb0fA64C8d53eBE65f31663199C6d";

    // default empty markets object, to be filled dynamically...
    this.markets = {
      // toggle variable to check if markets is initialized or not...
      initialized: false,
      // treasury liquidity infos...
      treasuryLiquidity: 0,
      // dough-v2 infos...
      dough: {
        price: 0,
        circSupply: 0,
        marketCap: 0
      }
    };

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
        expectedYearlyReturns: 0,
        expectedMonthlyReturns: 0,
        expectedApr: 0
      },
      user: {
        expectedYearlyReturns: 0,
        expectedMonthlyReturns: 0,
        expectedApr: 0        
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
          this.markets.dough.price = dough_market_data.current_price.usd;
          this.markets.dough.circSupply = dough_market_data.circulating_supply;
          this.markets.dough.marketCap = dough_market_data.market_cap.usd;
          
          // retrieving the balance of Treasury from address...
          // TODO: remove the hardcoded number and use API (Zapper, Zerion)...
          this.markets.treasuryLiquidity = 10000000;

          this.markets.initialized = true;
          resolve(this.markets);
    
          } catch(error) {
            reject(error);
          }        
      }
    });
  }

  calculate(inputs) {
    return new Promise(async (resolve, reject) => {
      this.project(inputs).then((projections) => {  
        let user_yearly_returns = projections.returns.user.reduce((total, value) => total += value);

        this.outputs.user = {
          expectedYearlyReturns: user_yearly_returns,
          expectedAverageMontlyReturns: user_yearly_returns / 12,
          expectedApr: (user_yearly_returns / (inputs.stakedDough * this.markets.dough.price)) * 100,
          expectedVeDough: this.calculateVeDough(inputs.stakedDough, inputs.commitment)
        };

        let treasury_yearly_returns = projections.farming.asset[12] - this.markets.treasuryLiquidity;        

        this.outputs.treasury = {
          expectedYearlyReturns: treasury_yearly_returns,
          expectedAverageMontlyReturns: treasury_yearly_returns / 12,
          expectedApr: this.markets.treasuryLiquidity  / projections.farming.asset[12]
        };        

        // rounding the numbers of the returns object...
        this.roundNumbers(this.outputs, null, 2);

        resolve({outputs: this.outputs, breakdowns: projections});
      }).catch(error => reject(error));
    });
  }

  calculateVeDough(stakedDough, commitment) {    
    return stakedDough * this.calculateCommitmentMultiplier(commitment);
  }

  calculateCommitmentMultiplier(commitment) {
    return commitment / this.k * Math.log10(commitment);
  }

  calculateCompound(value) {
    return value * (this.rewards.compound / 100);
  }

  project(inputs) {
    return new Promise(async(resolve, reject) => {
      this.initMarkets().then(() => {
        let projections = {
          farming: {
            asset: [],
            gains: [],
            compounds: [],
            staking_rewards: []
          }, 
          returns: {
            per_ve_dough: [],
            user: [] 
          }
        };

        let farming_asset = this.markets.treasuryLiquidity;
        let total_staked_ve_dough = inputs.stakedVeDough + this.calculateVeDough(inputs.stakedDough, inputs.commitment);

        // calculating the projections for the next 12 months...
        for(let i = 0; i < 13; i++) {
          projections.farming.asset[i] = farming_asset;
          projections.farming.gains[i] = (farming_asset * (inputs.expectedApr / 100)) / 12;
          projections.farming.compounds[i] = projections.farming.gains[i] * (this.rewards.compound / 100);
          projections.farming.staking_rewards[i] = i == 0 ? 0 : projections.farming.gains[i] * (this.rewards.distributed / 100);
        
          projections.returns.per_ve_dough[i] = projections.farming.staking_rewards[i] / (total_staked_ve_dough * (1 - (inputs.rewardsUnclaimed / 100)));
          projections.returns.user[i] = projections.returns.per_ve_dough[i] * this.calculateVeDough(inputs.stakedDough, inputs.commitment);
          
          // adding the montly compound into the farming asset...
          farming_asset += this.calculateCompound(projections.farming.gains[i]);
        }

        resolve(projections);
      }).catch(error => reject(error));      
    });
  }

  roundNumbers(object, key = "root", decimals = 4) {
    Object.keys(object).forEach(key => {
      if(typeof(object[key]) == "object") {
        this.roundNumbers(object[key], key, decimals);
      } else {
        object[key] = Number.parseFloat(object[key]).toFixed(decimals);
      }
    });
  }
}