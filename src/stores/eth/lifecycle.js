import { get } from 'svelte/store';
import { eth } from './writables.js';
import { subject } from './observables.js';
import { fetchEthBalances } from '../../helpers/multicall';

const trackedEthBalances = new Set();

// subject("block").subscribe({ next: (block) => console.log("block", block) });
subject('blockNumber').subscribe({
  next: async (currentBlockNumber) => {
    // console.log("currentBlockNumber", currentBlockNumber, Date.now());
    const ethData = get(eth);

    eth.set({ ...ethData, currentBlockNumber });
    subject('block').next(await ethData.provider.getBlock(currentBlockNumber));

    if (ethData.signer) {
      subject('gasPrice').next((await ethData.signer.getGasPrice).toString());
    }

    const arrWallets = [];
    trackedEthBalances.forEach((walletAddress) => {
      arrWallets.push(walletAddress);
    });

    const multiBalances = await fetchEthBalances(arrWallets, ethData.provider);

    trackedEthBalances.forEach(async (walletAddress) => {
      subject(`ethBalanceOf${walletAddress}`).next(multiBalances[walletAddress].toString());
    });
  },
});

export const bumpLifecycle = () => {
  subject('blockNumberBump').next(get(eth).currentBlockNumber);
};

export const trackEthBalance = (walletAddress) => {
  trackedEthBalances.add(walletAddress);
  const subj = subject(`ethBalanceOf${walletAddress}`);
  get(eth).provider.getBalance(walletAddress).then((balance) => {
    subj.next(balance.toString());
  });
  return subj;
};

export const updateCurrentBlock = (currentBlockNumber) => {
  subject('blockNumber').next(currentBlockNumber);
};
