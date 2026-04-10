/**
 * PM2: deploy orchestration (git + hook).
 * - Builda il client in locale e carica `dist/` sulla macchina remota
 * - Fa deploy del backend e lo (ri)avvia via PM2
 * Nessun uso di Docker.
 */
const HOST = '217.160.58.145';
const USER = 'root';

const PROJECT_PRODUCTION = 'socialize';

function productionPostDeploy() {
  const base = `/srv/nodeapps/${PROJECT_PRODUCTION}/source`;
  const upload = `/srv/nodeapps/${PROJECT_PRODUCTION}-upload-production`;
  return [
    `cd ${base}`,
    `mkdir -p ${base}/frontend/dist`,
    `cp -r ${upload}/. ${base}/frontend/dist/`,
    `rm -rf ${upload}`,
    `cd ${base}/backend && npm ci && npm run build`,
    `cd ${base} && pm2 startOrReload ecosystem.config.cjs --env production`,
    `pm2 save`,
  ].join(' && ');
}

function productionPreDeployLocal() {
  const base = `/srv/nodeapps/${PROJECT_PRODUCTION}/source`;
  const upload = `/srv/nodeapps/${PROJECT_PRODUCTION}-upload-production`;
  return [
    // 1) Build client in locale
    `cd frontend`,
    `npm ci`,
    `npm run build`,
    // 2) Upload dist su server (cartella temporanea)
    `ssh ${USER}@${HOST} "rm -rf ${upload} && mkdir -p ${upload}"`,
    // Copia i contenuti di dist/ (non la cartella dist stessa) per evitare dist/dist sul server
    `scp -r dist/. ${USER}@${HOST}:${upload}/`,
    // 3) Upload env production del backend (aggiornato per Mongo remoto)
    `ssh ${USER}@${HOST} mkdir -p ${base}/backend`,
    // @fastify/env con `dotenv: true` carica per default solo `.env`
    `scp ../backend/.env.production ${USER}@${HOST}:${base}/backend/.env`,
  ].join(' && ');
}

module.exports = {
  apps: [
    {
      name: `${PROJECT_PRODUCTION}-api`,
      cwd: './backend',
      script: 'npm',
      args: 'start',
      time: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: `${PROJECT_PRODUCTION}-web`,
      cwd: './frontend/dist',
      script: 'npx',
      args: 'serve -l 8080 --single',
      time: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: USER,
      host: HOST,
      ref: 'origin/main',
      repo: 'git@github.com:giggioz/socialize.git',
      path: `/srv/nodeapps/${PROJECT_PRODUCTION}`,
      'pre-deploy-local': productionPreDeployLocal(),
      'post-deploy': productionPostDeploy(),
    },
  },
};

