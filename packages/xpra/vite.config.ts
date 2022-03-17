import * as path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

const plugins = []

if (process.env.VITE_STATS) {
  plugins.push(visualizer())
}

export default defineConfig({
  base: '',
  plugins: [dts(), ...plugins],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Xpra',
      fileName: (format) => `xpra.${format}.js`,
    },
  },
})
