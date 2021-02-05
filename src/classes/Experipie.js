/* eslint-disable */
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { erc20 } from "@pie-dao/abis";
import ABI from '../config/experipieABI.json';
import defiSdkABI from '../config/defiSdkABI.json';
import yVaultABI from '../abis/yVaultABI.json';
import xSUSHIABI from '../abis/xSUSHIAbi.json';
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

        let info = find(this.marketData, (o) => {
          return o.address === el.toLowerCase();
        });

        let price = get(find(this.marketData, (o) => {
          return o.address === el.toLowerCase();
        }), 'market_data.current_price', 0);

        let decimal = info && info.decimals ? info.decimals : 18;

        this.composition.push(
          {
            address: el.toLowerCase(),
            price,
            balance: {
              bn: response[2].amounts[i],
              label: getNormalizedNumber(response[2].amounts[i].toString(), decimal).toString()
            },
          }
        )

        this.map[el.toLowerCase()] = {
          price,
          balance: {
            bn: response[2].amounts[i],
            label: getNormalizedNumber(response[2].amounts[i].toString(), decimal).toString()
          }
        }
      });
      
      //Leave this here
      this.totalSupply = this.totalSupply / 1e18;
      await this.fetchLentAssets();
      this.mergeInfo();
      this.calcNav();
      this.calcWeights();
    }

    async applyPatches() {

      const xsushi = "0x8798249c2e607446efb7ad49ec89dd1865ff4272".toLowerCase();
      const sushi = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2".toLowerCase();

      let price = get(find(this.marketData, (o) => {
        return o.address === sushi;
      }), 'market_data.current_price', 0);

      if(this.map[xsushi]) {
        const xsushiContract = new ethers.Contract(xsushi, xSUSHIABI, this.provider);
        const sushiContract = new ethers.Contract(sushi, erc20, this.provider);

        let totalShares = await xsushiContract.totalSupply();
        let balanceXsushi = await sushiContract.balanceOf(xsushi);
        let share = this.map[xsushi].balance.bn;
        const sushiBalance = share.mul(balanceXsushi).div(totalShares);    

        
        this.map[xsushi] = {
          ...this.map[xsushi],
          address: xsushi,
          decimals: 18,
          name: "SushiBar",
          symbol: "xSUSHI",
          protocol: {
            description: "",
            iconURL: "",
            name: "SushiBar",
          },
          underlying: {
            price,
            address: sushi,
            decimals: 18,
            name: "Sushi",
            symbol: "SUSHI",
            protocol: {
              description: "",
              iconURL: "",
              name: "SushiBar",
            },
            balance: {
              bn: sushiBalance,
              label: getNormalizedNumber(sushiBalance.toString(), 18).toString()
            }
          }
        }
      }

      const yfi = "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e".toLowerCase();
      const yYFI = "0xba2e7fed597fd0e3e70f5130bcdbbfe06bb94fe1".toLowerCase();

      

      price = get(find(this.marketData, (o) => {
        return o.address === yfi;
      }), 'market_data.current_price', 0);

      // const yYFIContract = new ethers.Contract(yYFI, yVaultABI, this.provider);
      // let priceFullShare = await yYFIContract.getPricePerFullShare();
      // let yfiUnderBalance = priceFullShare.mul(this.map[yYFI].balance.bn);

      if(this.map[yYFI]) {
        this.map[yYFI] = {
          ...this.map[yYFI],
          address: yYFI,
          decimals: 18,
          name: "yGOV",
          symbol: "yGOV",
          protocol: {
            description: "",
            iconURL: "",
            name: "yGOV",
          },
          underlying: {
            price,
            address: yfi,
            decimals: 18,
            name: "YFI",
            symbol: "YFI",
            protocol: {
              description: "",
              iconURL: "",
              name: "yGOV",
            },
            balance: this.map[yYFI].balance
          }
        }
      }
    }

    async fetchLentAssets() {
      let balancesOnSelectedProtocols = await this.defiSdk.getProtocolBalances(
          this.address, ['Aave', 'Compound', 'C.R.E.A.M.']
      );

      await this.applyPatches();

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