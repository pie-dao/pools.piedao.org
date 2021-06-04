import { getTokenImage } from '../components/helpers';

// eslint-disable-next-line import/prefer-default-export
export const addTokenToMM = (pie, address) => {
  /* eslint-disable no-undef */
  ethereum.sendAsync({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address,
        symbol: pie.symbol,
        decimals: 18,
        image: getTokenImage(address),
      },
    },
    id: Math.round(Math.random() * 100000),
  }, (err, added) => {
    if (added) {
      console.log('Thanks for your interest!');
    } else {
      /* eslint-disable no-alert */
      alert('Something went wrong. Is Metamask there?');
      /* eslint-enable no-alert */
    }
  });
  /* eslint-enable no-undef */
};
