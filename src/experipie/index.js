/* eslint-disable */
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import ABI from '../config/experipieABI.json';
import defiSdkABI from '../config/defiSdkABI.json';

function getNormalizedNumber(number, decimals) {
  return new BigNumber(number).dividedBy(
      new BigNumber(10).pow(decimals)
  );
}

const DeFiSdkAddress = '0x06FE76B2f432fdfEcAEf1a7d4f6C3d41B5861672';

class Experipie {

    constructor(address, provider) {
        this.address = address;
        this.instance = new ethers.Contract(address, ABI, provider);
        this.defiSdk = new ethers.Contract(DeFiSdkAddress, defiSdkABI, provider);
        this.composition = [];
        this.map = {};
    }

    dump() {
        console.log(this);
    }

    async initialize() {
      this.totalSupply = await this.instance.functions.totalSupply();

      const response = await Promise.all([
        this.instance.functions.symbol(),
        this.instance.functions.decimals(),
        this.instance.functions.calcTokensForAmount(this.totalSupply.toString()),
      ])

      this.symbol = response[0][0];
      this.decimals = response[1];
      this.composition = response[2].tokens.map((el, i) => {
        return {
          address: el.toLowerCase(),
          balance: {
            bn: response[2].amounts[i],
            label: response[2].amounts[i] / 1e18
          },
        }
      });

      response[2].tokens.forEach((el, i) => {
        this.map[el] = {
          balance: {
            bn: response[2].amounts[i],
            label: getNormalizedNumber(response[2].amounts[i].toString(), 18).toString()
          }
        }
      });

      this.totalSupply = this.totalSupply / 1e18

      this.dump();

      await this.fetchLentAssets();
    }

    async fetchLentAssets() {
      let balancesOnSelectedProtocols = await this.defiSdk.getProtocolBalances(
          this.address, ['Aave', 'Compound', 'Cream']
      );

      balancesOnSelectedProtocols.forEach((protocol) => {
          protocol.adapterBalances.forEach((protocolBalances) => {
              protocolBalances.balances.forEach((balance) => {
                  this.map[balance.base.metadata.token.toLowerCase()] = {
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
                          console.log('asset', asset)
                          this.map[balance.base.metadata.token.toLowerCase()].underlying = {
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

      console.log('map', this.map)
    }
}

export default Experipie;