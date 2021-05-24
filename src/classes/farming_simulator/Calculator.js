import { CoinGecko } from '../../stores/coingecko.js';

export default class Calculator {
  constructor() {
    // default treasury address, just a placeholder for now
    // TODO: change it for real address before go live...
    this.treasury_address = '0x4efD8CEad66bb0fA64C8d53eBE65f31663199C6d';

    // default empty markets object, to be filled dynamically...
    this.markets = {
      // toggle variable to check if markets is initialized or not...
      initialized: false,
      // treasury liquidity infos...
      treasuryLiquidity: {
        amount: 0,
        eth_value: 0
      },
      // dough-v2 infos...
      dough: {
        price: 0,
        circSupply: 0,
        marketCap: 0,
      },
    };

    // default rewards object...
    this.rewards = {
      distributed: 60,
      compound: 25,
      costs: 15,
    };

    // default constant...
    this.k = 56.0268900276223;
    
    // default empty projections object, to be filled dynamically...
    this.projections = {
      farming: {
        asset: [],
        gains: [],
        compounds: [],
        staking_rewards: [],
        totalStakedVeDough: 0
      },
      returns: {
        per_ve_dough: [],
        user: [],
      },
    };    
  }

  getMarkets() {
    return this.markets;
  }

  getProjections() {
    return this.projections;
  }  

  initMarkets() {
    return new Promise((resolve, reject) => {
      // if the markets object is already initialized, we simply return it back
      // avoiding making too many requests to coingecko considering that on input-change event
      // we shall recalculate the final user's profits...
      if (this.markets.initialized) {
        resolve(this.markets);
      } else {
        CoinGecko.fetchCoinData('piedao-dough-v2').then((doughResponse) => {
          // retrieving the infos about DOUGH from coingecko...
          const doughMarketData = doughResponse.market_data;

          // saving the values we need inside our config object...
          this.markets.dough.price = doughMarketData.current_price.usd;
          this.markets.dough.circSupply = doughMarketData.circulating_supply;
          this.markets.dough.marketCap = doughMarketData.market_cap.usd;

          // retrieving the balance of Treasury from address...
          // TODO: remove the hardcoded number and use API (Zapper, Zerion)...
          CoinGecko.fetchPriceFromString("ethereum").then((response) => {
            this.markets.treasuryLiquidity.amount = 10000000;
            this.markets.treasuryLiquidity.eth_value = ((this.markets.treasuryLiquidity.amount) / response.ethereum.usd).toFixed(2);
            
            this.markets.initialized = true;
            resolve(this.markets);            
          }).catch((error) => reject(error));
        }).catch((error) => reject(error));
      }
    });
  }

  calculate(inputs) {
    return new Promise((resolve, reject) => {
      this.project(inputs).then((projections) => {
        let outputs = {};
        const userYearlyReturns = this.projections.returns.user.reduce((total, value) => total + value);

        outputs.user = {
          expectedYearlyReturns: userYearlyReturns,
          expectedAverageMontlyReturns: userYearlyReturns / 12,
          expectedApr: (userYearlyReturns / (inputs.stakedDough * this.markets.dough.price)) * 100,
          expectedVeDough: this.calculateVeDough(inputs.stakedDough, inputs.commitment),
        };

        const treasuryYearlyReturns = this.projections.farming.asset[12]
          - this.markets.treasuryLiquidity.amount;

        outputs.treasury = {
          expectedYearlyReturns: treasuryYearlyReturns,
          expectedAverageMontlyReturns: treasuryYearlyReturns / 12,
          expectedApr: this.markets.treasuryLiquidity.amount / this.projections.farming.asset[12],
        };

        // rounding the numbers of the returns object...
        Object.keys(outputs).forEach((key) => {
          outputs[key] = Calculator.roundNumbers(outputs[key], 2);
        });

        resolve({ outputs: outputs, breakdowns: projections });
      }).catch((error) => reject(error));
    });
  }

  calculateVeDough(stakedDough, commitment) {
    return stakedDough * this.calculateCommitmentMultiplier(commitment);
  }

  calculateCommitmentMultiplier(commitment) {
    return (commitment / this.k) * Math.log10(commitment);
  }

  calculateCompound(value) {
    return value * (this.rewards.compound / 100);
  }

  project(inputs) {
    return new Promise((resolve, reject) => {
      this.initMarkets().then(() => {
        let farmingAsset = this.markets.treasuryLiquidity.amount;

        this.projections.farming.totalStakedVeDough = inputs.stakedVeDough
          + this.calculateVeDough(inputs.stakedDough, inputs.commitment);

        // calculating the projections for the next 12 months...
        for (let i = 0; i < 13; i += 1) {
          this.projections.farming.asset[i] = farmingAsset;
          
          this.projections.farming.gains[i] = (farmingAsset * (parseFloat(inputs.expectedApr) / 100)) / 12;

          this.projections.farming.compounds[i] = this.projections.farming.gains[i]
            * (this.rewards.compound / 100);

          this.projections.farming.staking_rewards[i] = i === 0 ? 0
            : this.projections.farming.gains[i] * (this.rewards.distributed / 100);
          
          this.projections.returns.per_ve_dough[i] = this.projections.farming.staking_rewards[i]
            / (this.projections.farming.totalStakedVeDough * (1 - (parseInt(inputs.rewardsUnclaimed) / 100)));

          this.projections.returns.user[i] = this.projections.returns.per_ve_dough[i]
            * this.calculateVeDough(inputs.stakedDough, inputs.commitment);

          // adding the montly compound into the farming asset...
          farmingAsset += this.calculateCompound(this.projections.farming.gains[i]);
        }

        resolve(this.projections);
      }).catch((error) => reject(error));
    });
  }

  static roundNumbers(object, decimals = 4) {
    const roundedObject = {};

    Object.keys(object).forEach((key) => {
      roundedObject[key] = Number.parseFloat(object[key]).toFixed(decimals);
    });

    return roundedObject;
  }
}
