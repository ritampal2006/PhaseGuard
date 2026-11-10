import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendProxy = {
  '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/model-info': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/demo': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/predict': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/powerzoo-info': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/powerzoo-forecast': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/history': { target: 'http://127.0.0.1:8000', changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: backendProxy,
  },
  preview: {
    port: 5173,
    host: true,
    proxy: backendProxy,
  },
});
