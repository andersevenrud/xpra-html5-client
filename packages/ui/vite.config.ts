import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('packages/xpra/dist')) {
            return 'shared'
          } else if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
