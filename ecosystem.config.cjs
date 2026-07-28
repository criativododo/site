// PM2 process manager — Portal DODÔ (portal-backend).
// Executado a partir da raiz do repositório: `pm2 start ecosystem.config.cjs --env production`.
// portal-frontend não entra aqui: é build estático servido pelo Nginx (ver deploy/nginx.conf),
// não um processo Node de longa duração.
module.exports = {
  apps: [
    {
      name: "portal-backend",
      cwd: "./portal-backend",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      time: true,
      out_file: "./logs/portal-backend.out.log",
      error_file: "./logs/portal-backend.error.log",
      merge_logs: true,
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
