import { ethers } from "ethers";
import { get } from "svelte/store";

import { eth } from "./writables.js";

const etherscanApiKey = "67NWT4RN7W1TQ9NX4MIY1MCAIW52NK26SC";

const isPie = (abi) => abi.filter(({ name }) => name === "getImplementation");

export const findAbi = async (address) => {
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

  return abi;
};
