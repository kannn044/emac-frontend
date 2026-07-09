import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // dev: proxy /auth,/api,/embed ไป backend (default :3000)
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  // base path ของ deploy นี้ (ไม่ hardcode /emac อีกต่อไป — ตั้งผ่าน env ต่อ environment)
  //   root domain (เช่น emac.moph.go.th)  → VITE_BASE_PATH=/  (หรือปล่อยว่าง = default)
  //   subpath ใต้ domain แชร์ (เช่น POC)   → VITE_BASE_PATH=/emac/
  const basePath = env.VITE_BASE_PATH || '/';

  // host ที่ vite preview อนุญาตให้เสิร์ฟ (มาจาก nginx) — comma-separated ผ่าน env
  //   ตั้งตาม deploy: POC → VITE_ALLOWED_HOSTS=poc.moph.go.th
  //                   production → VITE_ALLOWED_HOSTS=emac.moph.go.th
  const extraHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  const allowedHosts = [...new Set([...extraHosts, 'localhost', '127.0.0.1'])];

  return {
    base: basePath,
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      host: '0.0.0.0',
      proxy: {
        '/auth': { target: apiTarget, changeOrigin: true },
        '/api': { target: apiTarget, changeOrigin: true },
        '/embed': { target: apiTarget, changeOrigin: true },
      },
    },
    // vite preview (prod) หลัง nginx — host ที่อนุญาตมาจาก env (ดูด้านบน)
    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4180,
      host: '127.0.0.1',
      allowedHosts,
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
