import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import multicallAbi from '../config/Multicall.json';

export const MULTICALL = {
  1: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  4: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  5: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  6: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  17: '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  42: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
  56: '0x1ee38d535d541c55c9dae27b12edf090c608e6fb',
  82: '0x579De77CAEd0614e3b158cb738fcD5131B9719Ae',
  97: '0x8b54247c6BAe96A6ccAFa468ebae96c4D7445e46',
  100: '0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a',
  128: '0x37ab26db3df780e7026f3e767f65efb739f48d8e',
  256: '0xC33994Eb943c61a8a59a918E2de65e03e4e385E0',
  1337: '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  wanchain: '0xba5934ab3056fca1fa458d30fbb3810c3eb5145f',
};

export function getNormalizedNumber(number, decimals) {
  return new BigNumber(number).dividedBy(new BigNumber(10).pow(decimals));
}

const abi = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getEthBalance',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function multicall(
  provider,
  /* eslint-disable no-shadow */
  abi, // : any[],
  /* eslint-enable no-shadow */
  calls, // : any[],
  options = {},
) {
  const network = '1';
  const multi = new Contract(MULTICALL[network], multicallAbi.abi, provider);
  const itf = new Interface(abi);
  try {
    const [, res] = await multi.aggregate(
      calls.map((call) => [call[0].toLowerCase(), itf.encodeFunctionData(call[1], call[2])]),
      options,
    );
    return res.map((call, i) => itf.decodeFunctionResult(calls[i][1], call));
  } catch (e) {
    return Promise.reject(e);
  }
}

/* eslint-disable max-len */
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
/* eslint-enable max-len */

export const roundDownLabel = (numberString) => {
  const number = parseFloat(numberString);
  return (Math.floor(number * 100) / 100).toString();
};

const getBalanceQuery = (tokensList, wallet) => tokensList.map((token) => [token.address, 'balanceOf', [wallet]]);

const getDecimalsQuery = (tokenList) => tokenList.map((token) => [token.address, 'decimals']);

const getAllowanceQuery = (tokensList, wallet, allowanceTarget) => tokensList.map((token) => [token.address, 'allowance', [wallet, allowanceTarget]]);

/**
 * Warning, token list has to contain eth at position [0]
 * @param {*} tokensList
 * @param {*} walletAddress
 * @param {*} provider
 * @param {*} allowanceTarget default to 0x Contract
 *
 */
export async function fetchBalances(
  tokensList,
  walletAddress,
  provider,
  allowanceTarget = '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
) {
  const tokensListWithoutEth = tokensList.slice(1);

  const balanceQuery = getBalanceQuery(tokensListWithoutEth, walletAddress);
  const decimalsQuery = getDecimalsQuery(tokensListWithoutEth);
  const allowanceQuery = getAllowanceQuery(tokensListWithoutEth, walletAddress, allowanceTarget);

  const response = await multicall(
    provider,
    abi,
    [
      [MULTICALL['1'], 'getEthBalance', [walletAddress]],
      ...balanceQuery,
      ...decimalsQuery,
      ...allowanceQuery,
    ],

    { blockTag: 'latest' },
  );

  const ethBalance = response[0];
  const responseClean = response.slice(1, response.length);
  const chunks = chunk(responseClean, tokensListWithoutEth.length);
  const balances = chunks[0];
  const decimals = chunks[1];
  const allowances = chunks[2];

  const newTokenList = [];

  // Let's put eth back
  newTokenList.push({
    ...tokensList[0],
    decimals: 18,
    allowance: new BigNumber(ethers.constants.MaxUint256.toString()),
    balance: {
      bn: new BigNumber(ethBalance.toString()),
      label: roundDownLabel(getNormalizedNumber(ethBalance.toString(), 18).toString()),
      number: parseFloat(getNormalizedNumber(ethBalance.toString(), 18).toString()),
    },
  });

  // We loop across all tokens
  for (let index = 0; index < tokensListWithoutEth.length; index += 1) {
    const balance = balances[index][0];
    const decimal = decimals[index][0];
    const allowance = allowances[index][0];

    newTokenList.push({
      ...tokensListWithoutEth[index],
      decimals: decimal,
      allowance: new BigNumber(allowance.toString()),
      balance: {
        bn: new BigNumber(balance.toString()),
        label: roundDownLabel(getNormalizedNumber(balance.toString(), decimal).toString()),
        number: parseFloat(getNormalizedNumber(balance.toString(), decimal).toString()),
      },
    });
  }

  return newTokenList;
}

export async function fetchEthBalances(addressList, provider) {
  const balanceQuery = addressList.map((address) => [MULTICALL['1'], 'getEthBalance', [address]]);

  const response = await multicall(provider, abi, [...balanceQuery], { blockTag: 'latest' });

  const balances = {};
  /* eslint-disable prefer-destructuring */
  for (let index = 0; index < addressList.length; index += 1) {
    balances[addressList[index]] = response[index][0];
  }
  /* eslint-enable prefer-destructuring */

  return balances;
}

export async function fetchOvensUserData(ovensList, walletAddress, provider) {
  const ovenAbi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'ethBalanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'outputBalanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'cap',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const balanceEthQuery = ovensList.map((oven) => [
    oven.addressOven,
    'ethBalanceOf',
    [walletAddress],
  ]);

  const balancePieQuery = ovensList.map((oven) => [
    oven.addressOven,
    'outputBalanceOf',
    [walletAddress],
  ]);

  const capQuery = ovensList.map((oven) => [oven.addressOven, 'cap']);

  const response = await multicall(
    provider,
    ovenAbi,
    [...balanceEthQuery, ...balancePieQuery, ...capQuery],

    { blockTag: 'latest' },
  );

  let userHasPosition = false;
  const chunks = chunk(response, ovensList.length);
  const balancesEth = chunks[0];
  const balancesPie = chunks[1];
  const caps = chunks[2];

  const ovenData = {};
  for (let index = 0; index < ovensList.length; index += 1) {
    const balanceEth = balancesEth[index][0];
    const cap = caps[index][0];
    const pieBalance = balancesPie[index][0];

    ovenData[ovensList[index].addressOven] = {
      ethBalance: {
        bn: new BigNumber(balanceEth.toString()),
        label: parseFloat(getNormalizedNumber(balanceEth.toString(), 18).toString()).toFixed(4),
        number: parseFloat(getNormalizedNumber(balanceEth.toString(), 18).toString()),
      },
      pieBalance: {
        bn: new BigNumber(pieBalance.toString()),
        label: parseFloat(getNormalizedNumber(pieBalance.toString(), 18).toString()).toFixed(4),
        number: parseFloat(getNormalizedNumber(pieBalance.toString(), 18).toString()),
      },
      cap: {
        bn: new BigNumber(cap.toString()),
        label: parseFloat(getNormalizedNumber(cap.toString(), 18).toString()).toFixed(4),
        number: parseFloat(getNormalizedNumber(cap.toString(), 18).toString()),
      },
    };

    if (parseFloat(getNormalizedNumber(balanceEth.toString(), 18).toString()) > 0) {
      userHasPosition = true;
    }

    if( parseFloat(getNormalizedNumber(balanceEth.toString(), 18).toString()) > 0) {
      userHasPosition = true;
    }
  }

  ovenData.userHasPosition = userHasPosition;

  console.log('ovenData', ovenData);

  return ovenData;
}
