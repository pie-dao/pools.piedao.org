import './i18n.js';
import App from './App.svelte';
import { subscribeToPoolWeights } from './components/helpers.js';
import poolsConfig from './config/pools.json';
import { pools } from './stores/eth.js';

pools.set(poolsConfig);

const poolsDefault = {};

for (let i = 0; i < poolsConfig.available.length; i++) {
  poolsDefault[poolsConfig.available[i]] = poolsConfig[poolsConfig.available[i]].composition;
  subscribeToPoolWeights(poolsConfig.available[i]);
}

pools.set(poolsDefault);

var app = new App({
  target: document.body,
});

export default app;

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
