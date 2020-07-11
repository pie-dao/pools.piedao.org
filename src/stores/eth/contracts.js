import { erc20 } from "@pie-dao/abis";
import { ethers } from "ethers";
import { get } from "svelte/store";
import { isAddress, validateIsAddress } from "@pie-dao/utils";

import { balanceKey } from "../../components/helpers.js";
import { eth } from "./writables";
import { findAbi } from "./abi";
import { subject } from "./observables";

let contracts = {};
const trackedBalances = new Set();

subject("blockNumber").subscribe({
  next: () => {
    trackedBalances.forEach(async (key) => {
      const { provider } = get(eth);
      const [token, account] = key.split(".");
      if (isAddress(token) && isAddress(account)) {
        const contract = await observableContract({ address: token });
        subject(key).next((await contract.balanceOf(account)).toString());
      } else {
        console.warn("Invalid key found in trackedBalances", key);
        console.warn("key should be formatted '[token address].[wallet address]'");
      }
    });
  },
});

export const observableContract = async ({ abi, address }) => {
  console.log("address is", address);
  validateIsAddress(address);

  if (contracts[address]) {
    return contracts[address];
  }

  let contractAbi = abi;

  if (!contractAbi) {
    try {
      contractAbi = await findAbi(address);
    } catch (e) {
      console.warn("Falling back on default erc20 abi for", address);
      contractAbi = erc20;
    }
  }

  const { provider, signer } = get(eth);

  if (signer) {
    contracts[address] = new ethers.Contract(address, contractAbi, signer);
  } else {
    contracts[address] = new ethers.Contract(address, contractAbi, provider);
  }

  contracts[address].trackBalance = async (account) => {
    validateIsAddress(account);
    const key = balanceKey(address, account);
    trackedBalances.add(key);
    const contract = await observableContract({ address });
    contract.balanceOf(account).then((balance) => {
      subject(key).next(balance.toString());
    });
    return subject(key);
  };

  return contracts[address];
};

export const resetContractCache = () => {
  contracts = {};
};
