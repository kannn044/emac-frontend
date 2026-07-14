/**
 * PM2 config — eMAC Hospital Portal (production: https://emac.moph.go.th)
 *   npm ci
 *   npm run build:emac                       # โหลด .env.production-emac (base=/, API same-origin)
 *   pm2 start ecosystem.emac.config.cjs
 *   pm2 save
 *
 * vite preview ฟังที่ 127.0.0.1:4180 — nginx (deploy/nginx-emac.conf) proxy / → :4180
 * และ proxy /auth,/api,/embed → https://api-mophlink.moph.go.th/drugallergy
 */
module.exports = {
  apps: [
    {
      name: 'emac-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run preview:emac', // ต้องเป็น mode เดียวกับตอน build (allowedHosts=emac.moph.go.th)
      env: { NODE_ENV: 'production' },
      autorestart: true,
      max_restarts: 10,
      time: true,
    },
  ],
};
