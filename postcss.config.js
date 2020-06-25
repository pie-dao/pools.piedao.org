const purgecss = require("@fullhuman/postcss-purgecss");
const tailwindcss = require("tailwindcss");

module.exports = {
  plugins: [
    require("postcss-import"),
    tailwindcss("./tailwind.config.js"),
    require("autoprefixer"),
    purgecss({
      content: ["./**/*.html", "./**/*.js", "./**/*.svelte"],
    }),
  ],
};
