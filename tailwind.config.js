const eth = require("@pie-dao/eth-tailwind");
const piedao = require("@pie-dao/tailwind");

module.exports = {
  purge: ["./src/**/*.svelte", "./public/*.html"],
  theme: {},
  variants: {},
  plugins: [piedao, eth],
};
