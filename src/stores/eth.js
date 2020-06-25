import BigNumber from "bignumber.js";
import jazzicon from "jazzicon";

import { erc20 } from "@pie-dao/abis";
import { ethers } from "ethers";
import { shortenAddress } from "@pie-dao/utils";
import { get, writable } from "svelte/store";

const etherscanApiKey = "67NWT4RN7W1TQ9NX4MIY1MCAIW52NK26SC";

const defaultEth = {
  address: undefined,
  currentBlockNumber: 0,
  icon: undefined,
  network: {},
  provider: undefined,
  shortAddress: "",
  signer: undefined,
};

export const balances = writable({});
export const eth = writable(defaultEth);
export const tokens = writable({});

const Web3Modal = window.Web3Modal.default;
const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

// LIFECYCLE

const updateBalance = async (account, { address, contract }, provider) => {
  console.log("update Balance", account, address);
  const reader = contract.connect(provider);

  const update = {};
  update[`${account}.${address}`.toLowerCase()] = BigNumber(
    (await reader.balanceOf(account)).toString()
  );

  console.log("update is", account, address, update);

  balances.set({ ...get(balances), ...update });
};

const updateCurrentBlock = (currentBlockNumber) => {
  const ethData = get(eth);
  eth.set({ ...ethData, currentBlockNumber });

  // Update balances
  if (ethData.address) {
    const trackedTokens = get(tokens);
    console.log("check balances for", ethData.address, Object.keys(trackedTokens));

    Object.keys(trackedTokens).forEach((token) => {
      updateBalance(ethData.address, trackedTokens[token], ethData.provider);
    });
  }
};

// CONNECTION MANAGEMENT

export const resetWeb3Listeners = () => {
  const { provider, web3 } = get(eth);

  if (provider) {
    provider.off("block", updateCurrentBlock);
  }

  if (web3) {
    web3.off("accountsChanged", connectWeb3);
    web3.off("chainChanged", resetWeb3);
    web3.off("disconnect", resetWeb3);
  }
};

export const resetWeb3 = () => {
  resetWeb3Listeners();
  eth.set(defaultEth);
};

export const setWeb3Listeners = () => {
  const { provider, web3 } = get(eth);

  if (provider) {
    provider.on("block", updateCurrentBlock);
  }

  if (web3) {
    web3.on("accountsChanged", connectWeb3);
    web3.on("chainChanged", resetWeb3);
    web3.on("disconnect", resetWeb3);
  }
};

export const connectWeb3 = async () => {
  try {
    resetWeb3Listeners();

    const web3 = await web3Modal.connect();

    if (!web3) {
      console.log("NOT CONNECTED");
      resetWeb3();
      return;
    }

    console.log("CONNECTED", web3);

    const provider = new ethers.providers.Web3Provider(web3);
    const currentBlockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const shortAddress = shortenAddress(address);

    const icon = jazzicon(16, parseInt(address.slice(2, 10), 16)).outerHTML;

    eth.set({
      address,
      currentBlockNumber,
      icon,
      network,
      provider,
      shortAddress,
      signer,
      web3,
    });

    setWeb3Listeners();
  } catch (e) {
    console.error("ERROR CONNECTION TO WEB3", e);
    resetWeb3();
  }
};

// SUBSCRIPTIONS

export const trackToken = async (address) => {
  const existing = get(tokens);
  const { provider } = get(eth);

  if (existing[address.toLowerCase()]) {
    console.log("already have token", address, existing[address]);
    return;
  }

  if (!provider) {
    console.log("track token deferred", address);
    // delay, waiting for provider connection
    setTimeout(() => trackToken(address), 500);
    return;
  }

  const update = {};

  let pie = false;

  try {
    const response = await fetch(
      `http://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apiKey=${etherscanApiKey}`
    );
    const decoded = await response.json();
    const abi = JSON.parse(decoded.result);

    if (abi.filter(({ name }) => name === "getImplementation")) {
      // Pie Proxy
      const contract = new ethers.Contract(address, abi, provider);
      const proxy = await contract.getImplementation();

      const response = await fetch(
        `http://api.etherscan.io/api?module=contract&action=getabi&address=${proxy}&apiKey=${etherscanApiKey}`
      );
      const decoded = await response.json();
      const proxyAbi = JSON.parse(decoded.result);
      proxyAbi.forEach((item) => abi.push(item));

      pie = true;
    }

    const contract = new ethers.Contract(address, abi);

    update[address.toLowerCase()] = {
      abi,
      address,
      contract,
      pie,
    };
  } catch (e) {
    console.log("track token catch", address, e);
    update[address.toLowerCase()] = {
      address,
      abi: erc20,
      contract: new ethers.Contract(address, erc20), // default to erc20
      pie,
    };
  }

  console.log("track token update", update);

  tokens.set({ ...get(tokens), ...update });
  updateBalance(get(eth).address, update[address.toLowerCase()], provider);
};
