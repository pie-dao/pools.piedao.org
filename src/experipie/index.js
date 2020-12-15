/* eslint-disable */
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import ABI from '../config/experipieABI.json';
import defiSdkABI from '../config/defiSdkABI.json';
import get from 'lodash/get';
import find from 'lodash/find';

export function getNormalizedNumber(number, decimals) {
  return new BigNumber(number).dividedBy(
      new BigNumber(10).pow(decimals)
  );
}

const DeFiSdkAddress = '0x06FE76B2f432fdfEcAEf1a7d4f6C3d41B5861672';

class Experipie {

    constructor(address, provider) {
        this.provider = provider;
        this.address = address;
        this.instance = new ethers.Contract(address, ABI, provider);
        this.defiSdk = new ethers.Contract(DeFiSdkAddress, defiSdkABI, provider);
        this.composition = [];
        this.map = {};
    }

    dump() {
        console.log('dump', this);
    }    

    async initialize(marketData = {}) {
      this.totalSupply = await this.instance.functions.totalSupply();
      this.marketData = Object.keys(marketData).map(function(key) {
        return { ...marketData[key], address: key.toLowerCase() };
      });

      const response = await Promise.all([
        this.instance.functions.symbol(),
        this.instance.functions.decimals(),
        this.instance.functions.calcTokensForAmount(this.totalSupply.toString()),
      ])

      this.symbol = response[0][0];
      this.decimals = response[1];
      this.composition = [];

      response[2].tokens.forEach((el, i) => {

        let price = get(find(this.marketData, (o) => {
          return o.address === el.toLowerCase();
        }), 'market_data.current_price', 0);

        this.composition.push(
          {
            address: el.toLowerCase(),
            price,
            balance: {
              bn: response[2].amounts[i],
              label: getNormalizedNumber(response[2].amounts[i].toString(), 18).toString()
            },
          }
        )

        this.map[el.toLowerCase()] = {
          price,
          balance: {
            bn: response[2].amounts[i],
            label: getNormalizedNumber(response[2].amounts[i].toString(), 18).toString()
          }
        }
      });

      console.log('this.composition', this.composition);
      
      //Leave this here
      this.totalSupply = this.totalSupply / 1e18;
      await this.fetchLentAssets();
      this.mergeInfo();
      this.calcNav();
      this.calcWeights();
    }

    async fetchLentAssets() {
      let balancesOnSelectedProtocols = await this.defiSdk.getProtocolBalances(
          this.address, ['Aave', 'Compound', 'Cream']
      );

      balancesOnSelectedProtocols.forEach((protocol) => {
          protocol.adapterBalances.forEach((protocolBalances) => {
              protocolBalances.balances.forEach((balance) => {

                  let price = get(find(this.marketData, (o) => {
                    return o.address === balance.base.metadata.token.toLowerCase();
                  }), 'market_data.current_price', 0);

                  this.map[balance.base.metadata.token.toLowerCase()] = {
                    price,
                    address: balance.base.metadata.token.toLowerCase(),
                    decimals: balance.base.metadata.decimals,
                    name: balance.base.metadata.name,
                    symbol: balance.base.metadata.symbol,
                    protocol: {
                      description: protocol.metadata.description,
                      iconURL: protocol.metadata.iconURL,
                      name: protocol.metadata.name,
                    },
                    balance: {
                      bn: balance.base.amount,
                      label: getNormalizedNumber(balance.base.amount.toString(), balance.base.metadata.decimals).toString()
                    }
                  }

                  // If asset is a derivative then there will be underlying assets
                  if(balance.underlying.length > 0) {
                      balance.underlying.forEach((asset) => {
                          let price = get(find(this.marketData, (o) => {
                            return o.address === asset.metadata.token.toLowerCase();
                          }), 'market_data.current_price', 0);

                          this.map[balance.base.metadata.token.toLowerCase()].underlying = {
                            price,
                            address: asset.metadata.token.toLowerCase(),
                            decimals: asset.metadata.decimals,
                            name: asset.metadata.name,
                            symbol: asset.metadata.symbol,
                            protocol: {
                              description: protocol.metadata.description,
                              iconURL: protocol.metadata.iconURL,
                              name: protocol.metadata.name,
                            },
                            balance: {
                              bn: asset.metadata,
                              label: getNormalizedNumber(asset.amount.toString(), asset.metadata.decimals).toString()
                            }
                          }
                      });
                  }

              })
          })
      });

    }

    async calcNav() {
      let totalUSD = 0;
      this.composition.forEach( t => {
        let mapped = this.map[t.address.toLowerCase()];
        let valueAssetUSD = 0;
        if(mapped.underlying) {
          valueAssetUSD = parseFloat(mapped.underlying.balance.label) * mapped.underlying.price;
        } else {
          valueAssetUSD = parseFloat(t.balance.label) * mapped.price;
        }
        t.usdValue = valueAssetUSD;
        totalUSD += valueAssetUSD
      })

      this.marketCap = totalUSD;
      this.nav = totalUSD / this.totalSupply;
    }

    async mergeInfo() {
      this.composition.forEach( t => {
        let mapped = this.map[t.address.toLowerCase()];
        if(mapped.underlying) {
          t.name = mapped.name;
          t.decimals = mapped.decimals; 
          t.symbol = mapped.symbol; 
        }
      })
    }

    async calcWeights() {
      this.composition.forEach( t => {
        t.percentage = (t.usdValue / this.marketCap) * 100
      })
    }
}

export default Experipie;