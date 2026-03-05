import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'leaferjs-knowledge-graph': resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
