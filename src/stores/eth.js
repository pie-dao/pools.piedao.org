import jazzicon from "jazzicon";

import { ethers } from "ethers";
import { shortenAddress } from "@pie-dao/utils";
import { get, writable } from "svelte/store";

const defaultEth = {
  address: undefined,
  currentBlockNumber: 0,
  icon: undefined,
  network: {},
  provider: undefined,
  shortAddress: "",
  signer: undefined,
};

export const eth = writable(defaultEth);

const Web3Modal = window.Web3Modal.default;
const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

export const resetWeb3 = async () => {
  eth.set(defaultEth);
};

export const connectWeb3 = async () => {
  console.log("fired");
  try {
    const web3 = await web3Modal.connect();

    if (!web3) {
      console.log("NOT CONNECTED");
      resetWeb3();
      return;
    }

    console.log("CONNECTED", web3);

    // Subscribe to accounts change
    web3.on("accountsChanged", () => connectWeb3());

    // Subscribe to chainId change
    web3.on("chainChanged", () => resetWeb3());

    // Subscribe to web3 disconnection
    web3.on("disconnect", () => resetWeb3());

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
    });

    provider.on("block", (currentBlockNumber) => {
      eth.set({ ...get(eth), currentBlockNumber });
    });
  } catch (e) {
    console.error("ERROR CONNECTION TO WEB3", e);
    resetWeb3();
  }
};
