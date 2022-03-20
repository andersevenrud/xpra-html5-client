import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/html5/js/lib/broadway/Decoder.js',
  output: {
    file: 'dist/broadway.esm.js',
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
    }),
    commonjs({
    }),
    babel({
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),
    terser(),
  ],
}
