const eth = require('@pie-dao/eth-tailwind');
const piedao = require('@pie-dao/tailwind');

module.exports = {
  content: ['./src/**/*.svelte', './public/*.html'],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      maxWidth: {
        '2xl': '40rem',
      },
    },
  },
  variants: {},
  plugins: [piedao, eth],
};
