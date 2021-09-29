import { ethers } from 'ethers';

const url = window.location.href;
const query = url.split('?')[1];

if (query) {
  const urlParams = new URLSearchParams(`?${query}`);
  if (urlParams.has('r')) {
    const ref = urlParams.get('r');

    if (ethers.utils.isAddress(ref)) {
      localStorage.setItem('ref', ref);
      console.log('//------------------------//');
      console.log('Ref has been set', ref);
      console.log('//------------------------//');
    }
  }
  // strip off all params from url
  /* eslint-disable prefer-destructuring */
  // window.location.href = url.split('?')[0];
  /* eslint-enable prefer-destructuring */
}
