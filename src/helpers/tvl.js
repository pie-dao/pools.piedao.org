/* eslint-disable import/prefer-default-export */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
import { pieSmartPool, erc20 } from '@pie-dao/abis';
import BigNumber from 'bignumber.js';
import {
  contract,
} from '../stores/eth.js';

async function getTokenPricesFromString(stringFeed) {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${stringFeed}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`);
  const result = await response.json();
  return result;
}

async function returnDecimals(address) {
  if (address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return 18;
  }
  const tokenContract = await contract({ abi: pieSmartPool, address });
  const decimals = await tokenContract.decimals();
  return decimals;
}

let pies = [
  // DEFI+S
  '0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c',
  // DEFI+L
  '0x78f225869c08d478c34e5f645d07a87d3fe8eb78',
  // DEFI++
  '0x8D1ce361eb68e9E05573443C407D4A3Bed23B033',
  // USD++
  '0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e',
  // BTC++
  '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd',
  // BCP
  '0xe4f726adc8e89c6a6017f01eada77865db22da14',
  '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31',
];

pies = pies.map((pie) => pie.toLowerCase());

const stakingPools = {
  // DOUGH/ETH
  '0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      // DOUGH
      '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
    ],
  },
  // DOUGH/ETH (OLD)
  '0x8314337d2b13e1A61EadF0FD1686b2134D43762F': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      // DOUGH
      '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
    ],
  },
  // DEFI+S/ETH (OLD)
  '0x220f25C2105a65425913FE0CF38e7699E3992B97': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ],
  },
  // DEFI+L/ETH (OLD)
  '0xc1a116cb2d354503f9ec5cb436a3b213f377631d': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0xa795600590a7da0057469049ab8f1284baed977e',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0xa795600590a7da0057469049ab8f1284baed977e',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ],
  },
  // DEFI+S/ETH
  '0xFcBB61bcd4909bf4AF708F15AAaa905E0978cAfc': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0x35333cf3db8e334384ec6d2ea446da6e445701df',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0x35333cf3db8e334384ec6d2ea446da6e445701df',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ],
  },
  // DEFI+L/ETH
  '0xb8E59ce1359d80E4834228eDd6a3F560e7534438': {
    lpType: 'balancer',
    // LP token (BPT)
    lp: '0xa795600590a7da0057469049ab8f1284baed977e',
    // Address in which the underlyings are deposited
    lpUnderlyingsAddress: '0xa795600590a7da0057469049ab8f1284baed977e',
    underlyings: [
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ],
  },
};

export async function fetchNav() {
  const tokenAmounts = {};

  async function pushTokenAmount(token, amount) {
    // Prevent double counting of TVL by excluding pies
    // eslint-disable-next-line no-param-reassign
    token = token.toLowerCase();
    if (pies.includes(token)) {
      return;
    }

    if (tokenAmounts[token] === undefined) {
      // create empty object
      tokenAmounts[token] = {
        decimals: 0,
        amount: 0,
        price: 0,
      };

      const decimals = await returnDecimals(token);
      let price;
      try {
        price = (await getTokenPricesFromString(token))[token.toLowerCase()].usd;
      } catch (e) {
        // If no price is found set it to 0
        price = 0;
      }

      tokenAmounts[token].decimals = decimals;
      tokenAmounts[token].price = price;
    }

    // eslint-disable-next-line max-len
    tokenAmounts[token].amount += ((new BigNumber(amount.toString())).dividedBy(10 ** tokenAmounts[token].decimals)).toNumber();
  }

  // Pies
  // eslint-disable-next-line no-restricted-syntax
  for (const pieAddress of pies) {
    const pie = await contract({ abi: pieSmartPool, address: pieAddress });
    const totalSupply = await pie.totalSupply();
    const tokensAndAmounts = await pie.calcTokensForAmount(totalSupply);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tokensAndAmounts.tokens.length; i++) {
      const token = tokensAndAmounts.tokens[i];
      const amount = tokensAndAmounts.amounts[i];
      await pushTokenAmount(token, amount);
    }
  }

  // Staking pools
  for (const stakingPoolAddress of Object.keys(stakingPools)) {
    const stakingPool = stakingPools[stakingPoolAddress];

    const lp = await contract({ abi: erc20, address: stakingPool.lp });

    const lpBalance = new BigNumber((await lp.balanceOf(stakingPoolAddress)).toString());
    const lpTotalSupply = new BigNumber((await lp.totalSupply()).toString());

    if (stakingPool.lpType === 'balancer') {
      // eslint-disable-next-line no-restricted-syntax
      for (const underlying of stakingPool.underlyings) {
        const underlyingContract = await contract({ abi: erc20, address: underlying });
        const tokenAmount = new BigNumber((await underlyingContract.balanceOf(stakingPool.lpUnderlyingsAddress)).toString());
        // console.log(tokenAmount.times(lpBalance).div(lpTotalSupply).toString());
        await pushTokenAmount(underlying, tokenAmount.multipliedBy(lpBalance).dividedBy(lpTotalSupply));
      }
    } else {
      throw new Error('lpType not supported');
    }
  }

  let nav = 0;

  // Sum up nav
  for (const tokenAddress of Object.keys(tokenAmounts)) {
    const tokenAmount = tokenAmounts[tokenAddress];

    nav += tokenAmount.amount * tokenAmount.price;
    console.log(tokenAddress, nav);
  }
  return nav;
}
