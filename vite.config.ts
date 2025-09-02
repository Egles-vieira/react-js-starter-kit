import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: true,
    port: 8080,
    strictPort: false,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/api-mobile': { target: 'http://localhost:4000', changeOrigin: true },
      '/api-ext': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },

  build: { sourcemap: true, outDir: 'dist' },
  define: { __DEV__: mode !== 'production', 'process.env': {} }, // polyfill p/ libs
}))
