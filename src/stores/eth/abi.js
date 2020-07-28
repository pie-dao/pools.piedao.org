import { ethers } from "ethers";
import { get } from "svelte/store";
import { pieSmartPool } from "@pie-dao/abis";

import pools from "../../config/pools.json";

import { eth } from "./writables.js";

const etherscanApiKey = "67NWT4RN7W1TQ9NX4MIY1MCAIW52NK26SC";

const isPie = (abi) => abi.filter(({ name }) => name === "getImplementation").length > 0;

const loadAbi = (address) => {
  try {
    if (pools.available.includes(address)) {
      return pieSmartPool;
    }

    const abi = window.localStorage.getItem(`abis.${address}`);
    if (abi) {
      return JSON.parse(abi);
    }
  } catch (e) {
    console.warn("Error parsing stored abi for address", address, e);
    window.localStorage.removeItem(`abis.${address}`);
  }

  return;
};

const storeAbi = (address, abi) => {
  try {
    window.localStorage.setItem(`abis.${address}`, JSON.stringify(abi));
  } catch (e) {
    console.warn("Unable to store abi for address", address, e);
  }
};

export const findAbi = async (address) => {
  const existing = loadAbi(address);

  if (existing) {
    return existing;
  }

  const response = await fetch(
    `http://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apiKey=${etherscanApiKey}`
  );
  const decoded = await response.json();
  const abi = JSON.parse(decoded.result);

  if (isPie(abi)) {
    // Pie Proxy
    const { provider } = get(eth);
    const contract = new ethers.Contract(address, abi, provider);
    const proxy = await contract.getImplementation();

    const response = await fetch(
      `http://api.etherscan.io/api?module=contract&action=getabi&address=${proxy}&apiKey=${etherscanApiKey}`
    );
    const decoded = await response.json();
    const proxyAbi = JSON.parse(decoded.result);
    proxyAbi.forEach((item) => abi.push(item));
  }

  storeAbi(address, abi);

  return abi;
};
