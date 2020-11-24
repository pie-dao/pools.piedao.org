import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import multicallAbi from '../config/Multicall.json';

const MULTICALL_ADDRESS = '';

// eslint-disable-next-line import/prefer-default-export
export async function multicall(provider, abi, calls, options = {}) {
  const multi = new Contract(MULTICALL_ADDRESS, multicallAbi, provider);
  const itf = new Interface(abi);
  try {
    const [, response] = await multi.aggregate(
      calls.map((call) => [call[0].toLowerCase(), itf.encodeFunctionData(call[1], call[2])]),
      options,
    );
    return response.map((call, i) => itf.decodeFunctionResult(calls[i][1], call));
  } catch (e) {
    return Promise.reject();
  }
}
