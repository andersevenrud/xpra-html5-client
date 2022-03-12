import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          } else if (id.includes('src/xpra/lib')) {
            return 'lib'
          }
        },
      },
    },
  },
})
