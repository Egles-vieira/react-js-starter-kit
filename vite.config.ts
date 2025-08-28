import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      plugins: [
        // Disable TypeScript checking
        ["@swc/plugin-transform-typescript", { 
          decorators: false 
        }]
      ]
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: false,
    rollupOptions: {
      onwarn: () => {},
    }
  },
  esbuild: false, // Disable esbuild TypeScript checking
  define: {
    "process.env": {}
  }
}));
