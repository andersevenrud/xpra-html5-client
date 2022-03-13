import * as path from 'path'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Xpra',
      fileName: (format) => `xpra.${format}.js`,
    },
    rollupOptions: {
      plugins: [
        typescript({
          emitDeclarationOnly: true,
        }),
      ],
    },
  },
})
