import { observableContract } from "./eth/contracts.js";
import { subject } from "./eth/observables.js";
import { registerConnection, resetConnection } from "./eth/connection.js";
export { balances, eth, pools } from "./eth/writables.js";

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
