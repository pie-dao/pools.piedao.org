const purgecss = require('@fullhuman/postcss-purgecss')
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss('./tailwind.config.js'),
    require('autoprefixer'),
    purgecss({
      content: ['./**/*.html', './**/*.jsx']
    })
  ],
};