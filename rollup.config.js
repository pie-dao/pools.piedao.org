import fs from "fs";
import commonjs from 'rollup-plugin-commonjs';
import json from "@rollup/plugin-json";
import path from "path";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";

const purgecss = require("@fullhuman/postcss-purgecss");
const tailwindcss = require("tailwindcss");

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const extensions = [".js", ".svelte"];

export default {
  input: "src/App.svelte",
  output: {
    dir: "build",
    format: "cjs",
  },
  watch: {
    include: "src/**",
  },
  plugins: [
    resolveRootImports({ root: "src", extensions }),
    postcss({
      plugins: [
        require("postcss-import"),
        tailwindcss("./tailwind.config.js"),
        require("autoprefixer"),
        purgecss({
          content: ["./**/*.html", "./**/*.js", "./**/*.svelte"],
        }),
      ],
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**',  // Default: undefined
      exclude: ['node_modules/foo/**', 'node_modules/bar/**'],  // Default: undefined
      // these values can also be regular expressions
      // include: /node_modules/

      // search for files other than .js files (must already
      // be transpiled by a previous plugin!)
      extensions: ['.js', '.coffee'],  // Default: [ '.js' ]

      // if true then uses of `global` won't be dealt with by this plugin
      ignoreGlobal: false,  // Default: false

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false,  // Default: true

      // explicitly specify unresolvable named exports
      // (see below for more details)
      namedExports: { 'react': ['createElement', 'Component'] },  // Default: undefined

      // sometimes you have to leave require statements
      // unconverted. Pass an array containing the IDs
      // or a `id => boolean` function. Only use this
      // option if you know what you're doing!
      ignore: ['conditional-runtime-dependency']
    }),
    json(),
    svelte({
      dev: !IS_PRODUCTION,
      include: "src/**/*.svelte",
    }),
    resolve({ extensions }),
    IS_PRODUCTION && terser(),
  ],
};

function resolveRootImports({ root, extensions }) {
  return {
    resolveId: (importee) => {
      if (importee[0] === "/") {
        for (const ext of extensions) {
          const rootPath = `${root}${importee}${ext}`;
          const fullPath = path.resolve(__dirname, rootPath);
          if (fs.existsSync(fullPath)) return fullPath;
        }
      }
      return null;
    },
  };
}
