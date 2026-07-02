/**
 * PM2 config — eMAC Hospital Portal (frontend, POC)
 *   npm run build          # build ก่อน (ได้ dist/ ที่ base=/emac/)
 *   pm2 start ecosystem.config.cjs
 *
 * vite preview ฟังที่ 127.0.0.1:4180 (port/host/allowedHosts ตั้งใน vite.config.ts)
 * nginx proxy /emac → :4180
 */
module.exports = {
  apps: [
    {
      name: 'emac-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run preview',
      env: { NODE_ENV: 'production' },
      autorestart: true,
      max_restarts: 10,
      time: true,
    },
  ],
};
