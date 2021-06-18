const config = require('dotenv').config().parsed;
const replace = require('@rollup/plugin-replace');

module.exports = {
  extends: "@snowpack/app-scripts-svelte",
  packageOptions: {
    rollup: {
      plugins: [
        require("rollup-plugin-node-polyfills")(),
        replace({
          // stringify the object       
          __myapp: JSON.stringify({
            env: {
              config // attached the .env config
            }
          }),
        }),        
      ]
    }
  },
  plugins: [
    [
      "@snowpack/plugin-postcss",
      "@snowpack/plugin-webpack"
    ],
  ],
};
