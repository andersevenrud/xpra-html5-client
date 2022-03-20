import coffeescript from "rollup-plugin-coffee-script";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
//import nodePolyfills from "rollup-plugin-node-polyfills";
import alias from "@rollup/plugin-alias";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/av.esm.js',
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    coffeescript(),
    alias({
      entries: [
        {
          find: "av",
          replacement: "./src/av.js",
        },
      ],
    }),
    //nodePolyfills(),
    nodeResolve({
      extensions: [".js", ".coffee"],
      //preferBuiltins: false,
    }),
    commonjs({
      extensions: [".js", ".coffee"],
      requireReturnsDefault: "auto",
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
