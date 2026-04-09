# Electron (app standalone)

Questa repository include una versione **standalone** basata su **Electron**, pensata per essere usata in locale (senza browser) e consegnata a un cliente come applicazione installabile.

## Requisiti

- **MongoDB** in locale (o raggiungibile via rete)
  - Default: `mongodb://127.0.0.1:27017/costruisci-i-tuoi-successi`
- **Porte**
  - Backend API: `3001` (default)

## Cosa contiene la versione standalone

- **UI**: bundle statico del frontend (`frontend/dist`)
- **Backend**: Node/Fastify compilato (`backend/dist`)
- **App Electron**: entrypoint `electron/main.cjs`

In modalità standalone l’app avvia **automaticamente** il backend come processo interno e la UI chiama l’API su `http://localhost:3001`.

## Build e packaging (per chi prepara l’installer)

Dalla root del progetto:

```bash
npm install
npm run electron:build
```

Output:
- `dist-electron/`
  - macOS: `*.dmg` e app in `dist-electron/mac-*/...app`
  - Windows: installer NSIS (se buildato su Windows)
  - Linux: AppImage (se buildato su Linux)

> Nota: per generare un installer nativo per Windows/Linux conviene eseguire la build direttamente su Windows/Linux (o usare una pipeline CI dedicata).

## Dev (per sviluppatori)

```bash
npm run electron:dev
```

Avvia:
- backend in watch mode
- Vite dev server
- Electron che carica Vite

## Prima configurazione sul PC del cliente

Alla **prima apertura** della app, viene creato (se non esiste) un file di configurazione backend in:

- macOS: `~/Library/Application Support/costruisci-i-tuoi-successi/backend/.env`
- Windows: `%APPDATA%/costruisci-i-tuoi-successi/backend/.env`
- Linux: `~/.config/costruisci-i-tuoi-successi/backend/.env`

Il contenuto iniziale viene copiato dal template incluso nella app (`electron/backend.env.template`).

### Variabili importanti in `.env`

Impostare almeno:

- `MONGODB_URI`
- `JWT_SECRET`
- Chiavi provider (se usate):
  - `OPENAI_API_KEY` oppure `GOOGLE_API_KEY`
  - `SEARCH_API_KEY` (se il backend usa un provider di ricerca)

Esempio (minimo consigliato):

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/costruisci-i-tuoi-successi
JWT_SECRET=una-stringa-lunga-e-casuale
COOKIE_SECURE=false
CORS_ORIGIN=

LLM_PROVIDER=openai
LLM_MODEL=gpt-4.1-mini
OPENAI_API_KEY=...

SEARCH_PROVIDER=serper
SEARCH_API_KEY=...
```

### MongoDB

Se MongoDB **non** è installato sul PC del cliente:
- installarlo e avviarlo come servizio
- oppure indicare un `MONGODB_URI` verso un server già esistente (LAN/VPN)

## Uso (cliente)

1. Installare l’app (DMG su macOS / installer su Windows / AppImage su Linux).
2. Aprire l’app una prima volta (così crea la cartella di configurazione).
3. Chiudere l’app.
4. Modificare il file `.env` nel percorso indicato sopra, inserendo:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - eventuali API key
5. Riaprire l’app.

## Troubleshooting

### L’app si apre ma “non funziona” / errori API

- Verificare che **MongoDB** sia in esecuzione e raggiungibile dal valore `MONGODB_URI`.
- Verificare che la porta `3001` non sia occupata da altri processi.
- Verificare che le API key richieste siano presenti nel `.env`.

### Errore “address already in use :3001”

La porta `3001` è occupata. Soluzioni:
- chiudere l’altro processo che la usa
- oppure cambiare `PORT` nel `.env` e aggiornare l’app (richiede rebuild) se vuoi una porta diversa in modo stabile

### Reset configurazione

Chiudere l’app e cancellare la cartella:
- `costruisci-i-tuoi-successi` dentro la directory di “Application Support / AppData / .config”

Alla prossima apertura l’app rigenera il file `.env` dal template.

