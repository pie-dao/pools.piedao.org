import './i18n.js';
import App from './App.svelte';
import { subscribeToPoolWeights } from './components/helpers.js';
import pools from './config/pools.json';
import { pools as poolsStore } from './stores/eth.js';

poolsStore.set(pools);


var app = new App({
  target: document.body,
});

export default app;

const main = () => {
  // TODO iterate over the pools
  subscribeToPoolWeights('0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c');
};

main();

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
