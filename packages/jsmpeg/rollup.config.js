import babel from "@rollup/plugin-babel";
import { append, prepend } from "rollup-plugin-insert";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/jsmpeg.min.js',
  output: {
    file: 'dist/jsmpeg.esm.js',
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    prepend('var document = typeof document === "undefined" ? { addEventListener: function() {} } : document;'),
    prepend('var window = self;'),
    append('export default JSMpeg;'),
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
