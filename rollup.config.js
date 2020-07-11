import fs from "fs";
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
    format: "es",
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
