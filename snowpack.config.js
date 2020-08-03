module.exports = {
  extends: "@snowpack/app-scripts-svelte",
  scripts: {
    "build:css": "postcss",
  },
  installOptions: {
    rollup: {
      plugins: [require("rollup-plugin-node-polyfills")()]
    }
  },
  plugins: [],
};
