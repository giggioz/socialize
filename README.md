# Costruisci i tuoi successi

Monorepo con:

- `backend/`: API Fastify (build in `backend/dist/`)
- `frontend/`: React + Vite (build in `frontend/dist/`)

## Modalità di esecuzione (dev / docker / prod)

### Concetto chiave: `.env` “attivo” + preset

- **I processi leggono sempre e solo `.env`**:
  - backend: `backend/.env`
  - frontend: `frontend/.env`
- I file `*.env.development` / `*.env.production` sono **preset** da copiare su `.env` in base a come vuoi lanciare l’app.

### 1) Dev (hot reload, senza Docker)

Prerequisito: MongoDB in Docker su `127.0.0.1:27099`.

```bash
docker-compose -f docker-compose.mongo.yml up -d
cp backend/.env.development backend/.env
cp frontend/.env.development frontend/.env
npm install
npm run dev
```

- UI: `http://localhost:5173`
- API: `http://localhost:3001`

### 2) Docker in locale (stack “prod-like”)

```bash
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env
docker-compose up -d --build
```

- UI: `https://localhost/` (certificato locale → il browser può mostrare un warning)
- API: `https://localhost/api/*`

Creazione utente iniziale (es. `admin/admin`):

```bash

// DEV
npm run seed:user:dev -w backend -- --username=admin --password=admin

// PROD LIKE
docker-compose exec -T api node backend/dist/scripts/seed-user.js --username=admin --password=admin
```

## Deploy (Docker Compose) su singola VM

### Setup (una tantum)

- Installa Docker + Docker Compose sulla VM
- Apri solo porte **80/443** (e SSH)
- Clona questo repo sulla VM
- Crea i file env (non committare segreti):
  - `./backend/.env` (copialo da `./backend/.env.production`)
  - `./frontend/.env` (copialo da `./frontend/.env.production` — consigliato: `VITE_API_BASE_URL=/api`)
  - variabili root per Compose: `DOMAIN`, `CADDY_EMAIL` (opzionale), `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`

### Avvio / aggiornamento

```bash
docker-compose pull
docker-compose up -d
```

### CI → immagini → deploy

Il workflow GitHub Actions builda e pusha immagini su GHCR:

- `ghcr.io/<owner>/<repo>-api:<sha>`
- `ghcr.io/<owner>/<repo>-web:<sha>`

Per deployare una versione specifica, imposta `API_IMAGE` e `WEB_IMAGE` sul server e lancia:

```bash
./scripts/deploy.sh <sha>
```
