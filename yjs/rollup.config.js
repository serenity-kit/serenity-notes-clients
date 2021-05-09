import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "./index.js",
    output: {
      file: "../app/src/vendor/index.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      resolve({ mainFields: ["module", "browser", "main"] }),
      commonjs(),
    ],
  },
];
