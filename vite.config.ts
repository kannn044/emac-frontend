import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';
  // dev: proxy /auth,/api,/embed ไป backend (default :3000)
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';
  return {
    // prod deploy ใต้ subpath /emac (nginx: location /emac → vite preview)
    base: isProd ? '/emac/' : '/',
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/auth': { target: apiTarget, changeOrigin: true },
        '/api': { target: apiTarget, changeOrigin: true },
        '/embed': { target: apiTarget, changeOrigin: true },
      },
    },
    // vite preview (prod) หลัง nginx — อนุญาต host ของ POC + local
    preview: {
      port: 4180,
      host: '127.0.0.1',
      allowedHosts: ['poc.moph.go.th', 'localhost', '127.0.0.1'],
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
