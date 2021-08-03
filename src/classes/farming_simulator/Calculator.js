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
        eth_value: 0,
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
      median: {
        farming: {
          asset: [],
          gains: [],
          staking_rewards: [],
          totalStakedVeDough: 0,
        },
        returns: {
          per_ve_dough: [],
          user: [],
        },
      },
      lowest: {
        farming: {
          asset: [],
          gains: [],
          staking_rewards: [],
          totalStakedVeDough: 0,
        },
        returns: {
          per_ve_dough: [],
          user: [],
        },
      },
      highest: {
        farming: {
          asset: [],
          gains: [],
          staking_rewards: [],
          totalStakedVeDough: 0,
        },
        returns: {
          per_ve_dough: [],
          user: [],
        },
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
          CoinGecko.fetchPriceFromString('ethereum').then((response) => {
            this.markets.treasuryLiquidity.amount = 10000000;
            this.markets.treasuryLiquidity.eth_value = (
              (this.markets.treasuryLiquidity.amount) / response.ethereum.usd
            ).toFixed(2);

            this.markets.initialized = true;
            resolve(this.markets);
          }).catch((error) => reject(error));
        }).catch((error) => reject(error));
      }
    });
  }

  calculate(inputs) {
    return new Promise((resolve, reject) => {
      const normalizedInputs = Calculator.normalizeFormats(inputs);

      this.project(normalizedInputs).then((projections) => {
        const calculatedProjections = projections;

        const outputs = {};

        const userYearlyReturns = calculatedProjections.median.returns.user.slice(1, 13)
          .reduce((total, value) => total + value);

        outputs.user = {
          expectedYearlyReturns: userYearlyReturns,
          expectedAverageMontlyReturns: userYearlyReturns / 12,
          expectedApr: (
            userYearlyReturns / (normalizedInputs.stakedDough * this.markets.dough.price)
          ) * 100,
          expectedVeDough: this.calculateVeDough(
            normalizedInputs.stakedDough, normalizedInputs.commitment,
          ),
        };

        const treasuryYearlyReturns = calculatedProjections.median.farming.gains.slice(0, 12)
          .reduce((total, value) => total + value);

        outputs.treasury = {
          expectedYearlyReturns: treasuryYearlyReturns,
          expectedAverageMontlyReturns: treasuryYearlyReturns / 12,
          expectedApr: calculatedProjections.median.farming.asset[12]
            / this.markets.treasuryLiquidity.amount,
        };

        // rounding the numbers of the returns object...
        Object.keys(outputs).forEach((key) => {
          outputs[key] = Calculator.roundNumbers(outputs[key], 2);
        });

        // TODO: to be improved using roundNumers function...
        calculatedProjections.median.farming.totalStakedVeDough = projections
          .median.farming.totalStakedVeDough.toFixed(2);

        resolve({ outputs, breakdowns: calculatedProjections });
      }).catch((error) => reject(error));
    });
  }

  static normalizeFormats(inputs) {
    const normalizedInputs = {};

    Object.keys(inputs).forEach((key) => {
      if (typeof (inputs[key]) === 'string') {
        normalizedInputs[key] = parseFloat(inputs[key].replace(/[^0-9.]/g, ''));
      } else {
        normalizedInputs[key] = inputs[key];
      }
    });

    return normalizedInputs;
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
        // calculating the projections for the next 12 months...
        Object.keys(this.projections).forEach((key) => {
          let farmingAsset = this.markets.treasuryLiquidity.amount;

          this.projections[key].farming.totalStakedVeDough = inputs.stakedVeDough
            + this.calculateVeDough(inputs.stakedDough, inputs.commitment);

          let expectedApr = 0;

          switch (key) {
            default:
            case 'median':
              expectedApr = parseFloat(inputs.expectedApr);
              break;
            case 'lowest':
              expectedApr = parseFloat(inputs.expectedApr)
                - (parseFloat(inputs.expectedApr) * (1 - 0.25));
              break;
            case 'highest':
              expectedApr = parseFloat(inputs.expectedApr)
                + (parseFloat(inputs.expectedApr) * (1 - 0.25));
              break;
          }

          for (let i = 0; i < 36; i += 1) {
            this.projections[key].farming.asset[i] = farmingAsset;

            this.projections[key].farming.gains[i] = (farmingAsset * (expectedApr / 100)) / 12;

            this.projections[key].farming.staking_rewards[i] = i === 0 ? 0
              : this.projections[key].farming.gains[i] * (this.rewards.distributed / 100);

            this.projections[key].returns.per_ve_dough[i] = this.projections[key]
              .farming.staking_rewards[i] / (this.projections[key].farming.totalStakedVeDough
              * (1 - (parseInt(inputs.rewardsUnclaimed, 10) / 100)));

            this.projections[key].returns.user[i] = this.projections[key].returns.per_ve_dough[i]
              * this.calculateVeDough(inputs.stakedDough, inputs.commitment);

            // adding the montly compound into the farming asset...
            farmingAsset += this.calculateCompound(this.projections[key].farming.gains[i]);
          }
        });

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
