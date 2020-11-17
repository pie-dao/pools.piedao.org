import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { getSubgraphMetadata } from './subgraph.js';
import poolsConfig from '../config/pools.json';
import { contract } from '../stores/eth.js';

export const buildFormulaGraph = async (pieAddress) => {
  let formula = '';
  const { mapDynamicTradingViewFormula } = poolsConfig[pieAddress];
  if (!mapDynamicTradingViewFormula) return '';

  const poolContract = await contract({ address: pieAddress });
  const bPoolAddress = await poolContract.getBPool();
  let totalSupply = await poolContract.totalSupply();
  totalSupply = BigNumber(totalSupply.toString()).dividedBy(10 ** 18);

  const metadata = await getSubgraphMetadata(bPoolAddress.toLowerCase());

  metadata.tokens.forEach((component) => {
    const checksummed = ethers.utils.getAddress(component.address);
    formula += `${component.balance / totalSupply.toNumber()}*${
      mapDynamicTradingViewFormula[checksummed]
    }+`;
  });

  return formula;
};

export const buildFormulaNative = async (pieAddress, bPoolAddress, pools, balances) => {
  let formula = '';
  const { mapDynamicTradingViewFormula } = poolsConfig[pieAddress];
  if (!mapDynamicTradingViewFormula) return '';

  const poolContract = await contract({ address: pieAddress });
  let totalSupply = await poolContract.totalSupply();
  totalSupply = BigNumber(totalSupply.toString()).dividedBy(10 ** 18);

  pools[pieAddress].forEach((component) => {
    const key = `${component.address.toLowerCase()}.${bPoolAddress.toLowerCase()}`;
    const bal = balances[key] || 0;

    if (bal !== 0) {
      formula += `${bal / totalSupply.toNumber()}*${
        mapDynamicTradingViewFormula[component.address]
      }+`;
    }
  });

  return formula;
};
