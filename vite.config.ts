import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/api-mobile': { target: 'http://localhost:4000', changeOrigin: true },
      '/api-ext': { target: 'http://localhost:4000', changeOrigin: true },
    },
    allowedHosts: ['8080-ild470q5x62hn7ul4ituv-738fbf52.manusvm.computer'],
  },

  build: { sourcemap: true, outDir: 'dist' },
  define: { __DEV__: mode !== 'production', 'process.env': {} }, // polyfill p/ libs
}))
