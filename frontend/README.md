# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Comandi (avvio app e log)

### Avvio con Docker (consigliato)

Dalla root del progetto (`costruisci-i-tuoi-successi/`):

```bash
docker compose up --build
```

- **Frontend (container `web`)**: `http://localhost:8080`
- **Backend API (container `api`)**: `http://localhost:3001`

### Vedere i log del server (backend)

Se stai usando Docker:

```bash
docker compose logs -f api
```

Se vuoi anche i log del frontend containerizzato:

```bash
docker compose logs -f web
```

### Avvio in locale (senza Docker)

Dalla root del progetto:

```bash
npm install
npm run dev
```

Questo comando avvia **backend** e **frontend** insieme (workspaces):

- backend: `npm run dev -w backend`
- frontend: `npm run dev -w frontend`

Per avviarli separatamente:

```bash
# backend
npm run dev -w backend

# frontend
npm run dev -w frontend
```

## Se cambio qualcosa in un `.env`, cosa devo fare?

- **Docker Compose**
  - `backend/.env.development` (usato da `docker-compose.yml` come `env_file`): devi **riavviare** il container `api`.

    ```bash
    docker compose up -d --force-recreate api
    ```

  - Se hai cambiato variabili che influiscono sulla **build dell’immagine** (tipicamente nel frontend, es. `VITE_*` “baked” in build): fai anche **rebuild**.

    ```bash
    docker compose up -d --build --force-recreate web
    ```

- **Locale**
  - backend: dopo modifiche a `backend/.env.*` basta **riavviare** il processo `npm run dev -w backend` (anche se `tsx watch` ricarica il codice, le env in genere richiedono restart).
  - frontend (Vite): dopo modifiche a `frontend/.env.*` devi **riavviare** `npm run dev -w frontend` per vedere le nuove variabili.
`
