import { getTokenImage } from '../components/helpers';

// eslint-disable-next-line import/prefer-default-export
export const addTokenToMM = (symbol, address, decimals, image = null) => {
  /* eslint-disable no-undef */
  ethereum.sendAsync(
    {
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          image: image || getTokenImage(address),
        },
      },
      id: Math.round(Math.random() * 100000),
    },
    (err, added) => {
      if (added) {
        console.log(`The ${symbol} token has been added to your Metamask!`);
      } else {
        /* eslint-disable no-alert */
        alert('Something went wrong. Is Metamask there?');
        /* eslint-enable no-alert */
      }
    },
  );
  /* eslint-enable no-undef */
};
