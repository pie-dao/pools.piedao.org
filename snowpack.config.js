module.exports = {
  extends: "@snowpack/app-scripts-svelte",
  packageOptions: {
    rollup: {
      plugins: [require("rollup-plugin-node-polyfills")()]
    }
  },
  plugins: [
    [
      "@snowpack/plugin-postcss",
      "@snowpack/plugin-webpack"
    ],
  ],
};
