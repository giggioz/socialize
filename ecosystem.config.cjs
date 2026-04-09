/**
 * PM2: deploy orchestration (git + hook). I container restano gestiti da Docker sul server.
 * Aggiorna `repo` con l’URL del tuo remoto Git.
 */
const HOST = '217.160.58.145';
const USER = 'root';

function compose(project) {
  return `bash scripts/compose-cmd.sh -p ${project} -f docker-compose.yml -f docker-compose.deploy.yml`;
}

const PROJECT_PRODUCTION = 'socialize';

function productionPostDeploy() {
  const base = '/srv/nodeapps/socialize/source';
  return [
    `cd ${base}`,
    `${compose(PROJECT_PRODUCTION)} up -d --build`,
  ].join(' && ');
}

function productionPreDeployLocal() {
  return [
    `scp backend/.env.production ${USER}@${HOST}:/srv/nodeapps/socialize/source/backend/.env.production`,
    `scp frontend/.env.production ${USER}@${HOST}:/srv/nodeapps/socialize/source/frontend/.env.production`,
  ].join(' && ');
}

module.exports = {
  apps: [],

  deploy: {
    production: {
      user: USER,
      host: HOST,
      ref: 'origin/main',
      repo: 'REPLACE_ME_WITH_YOUR_GIT_REMOTE',
      path: '/srv/nodeapps/costruisci-i-tuoi-successi',
      'pre-deploy-local': productionPreDeployLocal(),
      'post-deploy': productionPostDeploy(),
    },
  },
};

