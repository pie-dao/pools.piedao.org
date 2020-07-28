import { get } from "svelte/store";

import { eth } from "./writables.js";
import { subject } from "./observables.js";

// subject("block").subscribe({ next: (block) => console.log("block", block) });
subject("blockNumber").subscribe({
  next: async (currentBlockNumber) => {
    console.log("currentBlockNumber", currentBlockNumber, Date.now());
    const ethData = get(eth);
    eth.set({ ...ethData, currentBlockNumber });
    subject("block").next(await ethData.provider.getBlock(currentBlockNumber));
    if (ethData.signer) {
      subject("gasPrice").next((await ethData.signer.getGasPrice).toString());
    }
  },
});

export const bumpLifecycle = () => {
  subject("blockNumberBump").next(get(eth).currentBlockNumber);
};

export const updateCurrentBlock = (currentBlockNumber) => {
  subject("blockNumber").next(currentBlockNumber);
};
