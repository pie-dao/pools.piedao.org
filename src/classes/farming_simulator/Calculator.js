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
          this.markets.DOUGH.PRICE = dough_market_data.current_price.usd;
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
      this.project(inputs).then((projections) => {
        console.log(projections);
  
        let user_yearly_returns = projections.returns.user.reduce((total, value) => total += value);

        this.outputs.user = {
          EXPECTED_YEARLY_RETURNS: user_yearly_returns,
          EXPECTED_AVERAGE_MONTHLY_RETURNS: user_yearly_returns / 12,
          EXPECTED_APR: (user_yearly_returns / (inputs.STAKED_DOUGH * this.markets.DOUGH.PRICE)) * 100,
          EXPECTED_VEDOUGH: this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT)
        };

        let treasury_yearly_returns = projections.farming.asset[12] - this.markets.TREASURY_LIQUIDITY_DEPLOYED;        

        this.outputs.treasury = {
          EXPECTED_YEARLY_RETURNS: treasury_yearly_returns,
          EXPECTED_AVERAGE_MONTHLY_RETURNS: treasury_yearly_returns / 12,
          EXPECTED_APR: this.markets.TREASURY_LIQUIDITY_DEPLOYED  / projections.farming.asset[12]
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

        let farming_asset = this.markets.TREASURY_LIQUIDITY_DEPLOYED;
        let total_staked_ve_dough = inputs.STAKED_VEDOUGH + this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT);

        // calculating the projections for the next 12 months...
        for(let i = 0; i < 13; i++) {
          projections.farming.asset[i] = farming_asset;
          projections.farming.gains[i] = (farming_asset * (inputs.EXPECTED_APR / 100)) / 12;
          projections.farming.compounds[i] = projections.farming.gains[i] * (this.rewards.compound / 100);
          projections.farming.staking_rewards[i] = i == 0 ? 0 : projections.farming.gains[i] * (this.rewards.distributed / 100);
        
          projections.returns.per_ve_dough[i] = projections.farming.staking_rewards[i] / (total_staked_ve_dough * (1 - (inputs.REWARDS_UNCLAIMED / 100)));
          projections.returns.user[i] = projections.returns.per_ve_dough[i] * this.calculateVEDOUGH(inputs.STAKED_DOUGH, inputs.COMMITMENT);
          
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