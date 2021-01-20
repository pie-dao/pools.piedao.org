import BigNumber from 'bignumber.js';
import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import multicallAbi from '../config/Multicall.json';

export const MULTICALL = {
  '1': '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  '4': '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  '5': '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  '6': '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  '17': '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  '42': '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
  '56': '0x1ee38d535d541c55c9dae27b12edf090c608e6fb',
  '82': '0x579De77CAEd0614e3b158cb738fcD5131B9719Ae',
  '97': '0x8b54247c6BAe96A6ccAFa468ebae96c4D7445e46',
  '100': '0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a',
  '128': '0x37ab26db3df780e7026f3e767f65efb739f48d8e',
  '256': '0xC33994Eb943c61a8a59a918E2de65e03e4e385E0',
  '1337': '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  wanchain: '0xba5934ab3056fca1fa458d30fbb3810c3eb5145f'
};

export function getNormalizedNumber(number, decimals) {
  return new BigNumber(number).dividedBy(
      new BigNumber(10).pow(decimals)
  );
}

const abi = [
  {
    constant: true,
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs:[],
    name:"decimals",
    "outputs":[
       {
          "internalType":"uint8",
          "name":"",
          "type":"uint8"
       }
    ],
    "stateMutability":"view",
    "type":"function"
 },
 {
  "constant":true,
  "inputs":[
     {
        "name":"addr",
        "type":"address"
     }
  ],
  "name":"getEthBalance",
  "outputs":[
     {
        "name":"balance",
        "type":"uint256"
     }
  ],
  "payable":false,
  "stateMutability":"view",
  "type":"function"
},
{
  "inputs":[
     
  ],
  "name":"symbol",
  "outputs":[
     {
        "internalType":"string",
        "name":"",
        "type":"string"
     }
  ],
  "stateMutability":"view",
  "type":"function"
},
{
  "inputs":[
     {
        "internalType":"address",
        "name":"owner",
        "type":"address"
     },
     {
        "internalType":"address",
        "name":"spender",
        "type":"address"
     }
  ],
  "name":"allowance",
  "outputs":[
     {
        "internalType":"uint256",
        "name":"",
        "type":"uint256"
     }
  ],
  "stateMutability":"view",
  "type":"function"
},
];

export async function multicall(
  provider,
  abi, //: any[],
  calls, //: any[],
  options = {}
) {
  const network = '1';
  const multi = new Contract(MULTICALL[network], multicallAbi.abi, provider);
  const itf = new Interface(abi);
  try {
    const [, res] = await multi.aggregate(
      calls.map((call) => [
        call[0].toLowerCase(),
        itf.encodeFunctionData(call[1], call[2])
      ]),
      options
    );
    return res.map((call, i) => itf.decodeFunctionResult(calls[i][1], call));
  } catch (e) {
    return Promise.reject(e);
  }
}

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * Warning, token list has to contain eth at position [0]
 * @param {*} tokensList 
 * @param {*} walletAddress 
 * @param {*} provider 
 * @param {*} allowanceTarget default to 0x Contract
 * 
 */
export async function fetchBalances(tokensList, walletAddress, provider, allowanceTarget='0xdef1c0ded9bec7f1a1670819833240f027b25eff') {
  const tokensListWithoutEth = tokensList.slice(1);

  const balanceQuery = tokensListWithoutEth.map((token) => [
    token.address,
    'balanceOf',
    [walletAddress]
  ]);

  const decimalsQuery = tokensListWithoutEth.map((token) => [
    token.address,
    'decimals'
  ]);

  const allowanceQuery = tokensListWithoutEth.map((token) => [
    token.address,
    'allowance',
    [walletAddress, allowanceTarget]
  ]);

  const response = await multicall(
    provider,
    abi,
    [
      [MULTICALL['1'], 'getEthBalance', [walletAddress]],
      ...balanceQuery,
      ...decimalsQuery,
      ...allowanceQuery
    ],
    
    { blockTag: 'latest' }
  );

  const ethBalance = response[0];
  const responseClean = response.slice(1, response.length);
  const chunks = chunk(responseClean, tokensListWithoutEth.length);
  const balances = chunks[0];
  const decimals = chunks[1];
  const allowances = chunks[2];
  
  let newTokenList = [];

  // Let's put eth back
  newTokenList.push({
    ...tokensList[0],
    decimals: 18,
    balance: {
      bn: ethBalance,
      label: (parseFloat(getNormalizedNumber(ethBalance.toString(), 18).toString()).toFixed(2)).toString(),
      number: parseFloat(getNormalizedNumber(ethBalance.toString(), 18).toString()).toFixed(2)
    }
  })

  // We loop across all tokens
  for (let index = 0; index < tokensListWithoutEth.length; index++) {
    const balance = balances[index][0];
    const decimal = decimals[index][0];
    const allowance = allowances[index][0];
    

    newTokenList.push({
      ...tokensListWithoutEth[index],
      decimals: decimal,
      allowance,
      balance: {
        bn: balance,
        label: (parseFloat(getNormalizedNumber(balance.toString(), decimal).toString()).toFixed(2)).toString(),
        number: parseFloat(getNormalizedNumber(balance.toString(), decimal).toString())
      }
    })
  }

  //console.log('newTokenList', newTokenList);
  return newTokenList;
}