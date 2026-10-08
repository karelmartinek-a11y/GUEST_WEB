import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  define: { __RELEASE_SHA__: JSON.stringify(process.env.GITHUB_SHA?.slice(0,8) || process.env.RELEASE_SHA?.slice(0,8) || 'development') },
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1100,
    rollupOptions: { output: { manualChunks: { map: ['maplibre-gl', 'pmtiles'] } } } }
});
