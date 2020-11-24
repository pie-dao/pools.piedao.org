import { getTokenImage } from '../components/helpers';

// eslint-disable-next-line import/prefer-default-export
export const addTokenToMM = (pie) => {
  ethereum.sendAsync({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: pie.address,
        symbol: pie.symbol,
        decimals: 18,
        image: getTokenImage(pie.address),
      },
    },
    id: Math.round(Math.random() * 100000),
  }, (err, added) => {
    if (added) {
      console.log('Thanks for your interest!');
    } else {
      alert('Something went wrong. Is Metamask there?');
    }
  });
};
