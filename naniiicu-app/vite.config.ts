import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy shortened URLs (3+ chars, alphanumeric, hyphens, underscores)
      '^/[a-zA-Z0-9_-]{3,}$': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
