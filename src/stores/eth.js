import BigNumber from "bignumber.js";

import { ethers } from "ethers";

import { allowances, eth } from "./eth/writables.js";
import { displayNotification } from "../notifications";
import { functionKey } from "./eth/keys.js";
import { get } from "svelte/store";
import { observableContract } from "./eth/contracts.js";
import { registerConnection, resetConnection } from "./eth/connection.js";
import { subject } from "./eth/observables.js";

export { allowances, balances, eth, pools } from "./eth/writables.js";
export { balanceKey, functionKey } from "./eth/keys.js";
export { bumpLifecycle } from "./eth/lifecycle.js";
export { subject } from "./eth/observables.js";

const Web3Modal = window.Web3Modal.default;
const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

// CONNECTION MANAGEMENT

export const connectWeb3 = async () => {
  try {
    resetConnection();

    const web3 = await web3Modal.connect();

    if (!web3) {
      console.log("NOT CONNECTED");
      return;
    }

    console.log("CONNECTED", web3);

    registerConnection(web3);
  } catch (e) {
    console.error("ERROR CONNECTION TO WEB3", e);
    resetConnection();
  }
};

// SUBSPACE(ISH)

export const contract = async ({ abi, address }) => await observableContract({ abi, address });
export const trackBlock = async () => subject("block");
export const trackBlockNumber = async () => subject("blockNumber");
export const trackGasPrice = async () => subject("gasPrice");

// Shortcuts

export const approve = async (address, spender, amount) => {
  const erc20Contract = await contract({ address });
  const { hash } = await erc20Contract.approve(spender, amount);
  const { emitter } = displayNotification({ hash });
  const symbol = await erc20Contract.symbol();
  let currentBlockNumber;

  await new Promise((resolve) =>
    emitter.on("txConfirmed", ({ blockNumber }) => {
      currentBlockNumber = blockNumber;
      resolve();
      return { message: `${symbol} unlocked`, type: "success" };
    })
  );

  const decimals = await erc20Contract.decimals();
  const updates = {};
  const args = [get(eth).address, spender];
  const key = functionKey(address, "allowance", args);

  updates[key] = BigNumber(amount.toString()).dividedBy(10 ** decimals);
  console.log("update allowances", updates[key].toString(), { ...get(allowances), ...updates });
  allowances.set({ ...get(allowances), ...updates });
  const lastBlock = get(eth).currentBlockNumber;
  if (currentBlockNumber > lastBlock) {
    eth.set({ ...get(eth), currentBlockNumber });
  }
};

export const approveMax = async (address, spender) => {
  await approve(address, spender, ethers.constants.MaxUint256);
};
