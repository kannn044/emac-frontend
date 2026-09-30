// Linux checkout: /home/gdata/emac/emac-frontend
module.exports = {
  apps: [{
    name: 'emac-web',
    cwd: __dirname,
    script: './scripts/serve.mjs',
    env: { NODE_ENV: 'production', PORT: '4180' },
    autorestart: true,
    max_restarts: 10,
    time: true,
  }],
};
