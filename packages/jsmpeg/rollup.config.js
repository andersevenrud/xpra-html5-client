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
    append('export default JSMpeg;'),
    terser(),
  ],
}
