# Costruisci i tuoi successi

Monorepo con:

- `backend/`: API Fastify (build in `backend/dist/`)
- `frontend/`: React + Vite (build in `frontend/dist/`)

## Deploy (senza Docker) con PM2

Il deploy è orchestrato da `ecosystem.config.cjs` usando **PM2 Deploy**:

- in **locale** fa la build del frontend e carica `frontend/dist/` sul server via `scp`
- copia `backend/.env.production` sul server come `backend/.env`
- sul server fa `npm ci && npm run build` nel backend e poi `pm2 startOrReload ... --env production`

### Prerequisiti

- **In locale**
  - Node.js + npm
  - `pm2` installato: `npm i -g pm2`
  - accesso SSH al server configurato (chiave, host, user)
  - permessi per clonare il repo definito in `ecosystem.config.cjs` (GitHub SSH)

- **Sul server**
  - Node.js + npm
  - `pm2` installato: `npm i -g pm2`
  - `git` installato
  - porta 8080 raggiungibile (il frontend viene servito con `serve -l 8080 --single`)

### Configurazione

Apri `ecosystem.config.cjs` e verifica:

- `HOST`, `USER`
- `PROJECT_PRODUCTION`
- `deploy.production.repo` (repo SSH)
- `deploy.production.ref` (branch)
- `deploy.production.path` (es. `/srv/nodeapps/<nome>`)

Verifica anche che `backend/.env.production` sia aggiornato: durante il deploy viene caricato sul server come `backend/.env`.

### Primo deploy (setup)

Esegue il setup della directory di deploy sul server e clona il repository:

```bash
pm2 deploy ecosystem.config.cjs production setup
```

### Deploy (aggiornamento)

Esegue `pre-deploy-local` (build + upload) e `post-deploy` (install/build backend + reload):

```bash
pm2 deploy ecosystem.config.cjs production
```

### Gestione processi e log

```bash
pm2 status
pm2 logs
pm2 logs socialize-api
pm2 logs socialize-web
```

I nomi dei processi sono definiti in `ecosystem.config.cjs`:

- `<PROJECT_PRODUCTION>-api`
- `<PROJECT_PRODUCTION>-web`

### Note importanti

- **Build frontend**: viene fatta **in locale** (non sul server) e viene caricato solo `frontend/dist/`.
- **Env backend**: il backend usa `@fastify/env` e, in produzione, viene caricato il file `backend/.env` (che nel deploy viene sovrascritto copiando `backend/.env.production`).
- Se il copia/incolla negli appunti non funziona in produzione su web, assicurati di servire il frontend in un contesto sicuro (`https://`); in ogni caso l’app gestisce il fallback e non deve andare in crash.
