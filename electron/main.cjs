const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const FRONTEND_DEV_URL = process.env.ELECTRON_RENDERER_URL || "http://localhost:5173";
const BACKEND_PORT = Number(process.env.ELECTRON_BACKEND_PORT || 3001);

/** @type {import("child_process").ChildProcess | null} */
let backendProcess = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function ensureBackendEnvFile() {
  const userDataDir = app.getPath("userData");
  const backendDir = path.join(userDataDir, "backend");
  const envPath = path.join(backendDir, ".env");
  const templatePath = path.join(process.resourcesPath, "backend.env.template");

  fs.mkdirSync(backendDir, { recursive: true });

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, envPath);
    } else {
      fs.writeFileSync(
        envPath,
        [
          "NODE_ENV=production",
          `PORT=${BACKEND_PORT}`,
          "MONGODB_URI=mongodb://127.0.0.1:27017/costruisci-i-tuoi-successi",
          "JWT_SECRET=change-me",
          "CORS_ORIGIN=",
          "COOKIE_SECURE=false",
          "SEARCH_PROVIDER=serper",
          "SEARCH_API_KEY=",
          "SEARCH_MAX_RESULTS=5",
          "FETCH_TIMEOUT_MS=20000",
          "MAX_SOURCE_CHARS=40000",
          "LLM_PROVIDER=openai",
          "LLM_MODEL=gpt-4.1-mini",
          "LLM_BASE_URL=",
          "OPENAI_API_KEY=",
          "GOOGLE_API_KEY=",
          "LLM_TIMEOUT_MS=60000",
          "LLM_MAX_TOKENS=2000",
          "",
        ].join("\n"),
        "utf8",
      );
    }
  }

  return { backendDir, envPath };
}

function startBackendIfNeeded() {
  // In dev we usually start backend via npm scripts (avoid duplicates).
  if (process.env.ELECTRON_DEV === "1") return;
  if (backendProcess) return;

  const { backendDir, envPath } = ensureBackendEnvFile();
  const backendLogPath = path.join(backendDir, "backend.log");
  const backendDistEntry = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar.unpacked", "backend", "dist", "index.js")
    : path.join(app.getAppPath(), "backend", "dist", "index.js");

  if (!fs.existsSync(backendDistEntry)) {
    dialog.showErrorBox(
      "Backend non trovato",
      "Non trovo `backend/dist/index.js`. Esegui prima la build (npm run electron:build).",
    );
    return;
  }

  // In a packaged Electron app, process.execPath is the Electron binary.
  // To run a plain Node script without spawning a second Electron instance,
  // set ELECTRON_RUN_AS_NODE=1.
  backendProcess = spawn(process.execPath, [backendDistEntry], {
    cwd: backendDir,
    stdio: "pipe",
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      ELECTRON_RUN_AS_NODE: "1",
      ...(app.isPackaged
        ? {
            NODE_PATH: [
              path.join(process.resourcesPath, "app.asar.unpacked", "node_modules"),
              process.env.NODE_PATH,
            ]
              .filter(Boolean)
              .join(path.delimiter),
          }
        : null),
      // fastify-env legge `.env` dal cwd; qui puntiamo apposta a userData/backend
    },
  });

  const logStream = fs.createWriteStream(backendLogPath, { flags: "a" });
  logStream.write(`\n--- backend start ${new Date().toISOString()} ---\n`);

  backendProcess.on("error", (err) => {
    try {
      logStream.write(`[spawn error] ${String(err?.stack || err)}\n`);
    } catch {
      // ignore
    }
    dialog.showErrorBox(
      "Backend terminato",
      `Impossibile avviare il backend.\n\nErrore: ${err?.message || String(err)}\n\nLog: ${backendLogPath}`,
    );
  });

  backendProcess.stdout?.on("data", (d) => {
    try {
      logStream.write(d);
    } catch {
      // ignore
    }
    process.stdout.write(`[backend] ${d}`);
  });
  backendProcess.stderr?.on("data", (d) => {
    try {
      logStream.write(d);
    } catch {
      // ignore
    }
    process.stderr.write(`[backend] ${d}`);
  });
  backendProcess.on("exit", (code, signal) => {
    backendProcess = null;
    try {
      logStream.write(`\n--- backend exit code=${code ?? "?"} signal=${signal ?? "?"} ${new Date().toISOString()} ---\n`);
      logStream.end();
    } catch {
      // ignore
    }
    if (!app.isQuitting) {
      dialog.showErrorBox(
        "Backend terminato",
        `Il backend si è chiuso (code=${code ?? "?"}, signal=${signal ?? "?"}).\n\nControlla:\n- ${envPath}\n- ${backendLogPath}`,
      );
    }
  });
}

function stopBackendIfRunning() {
  if (!backendProcess) return;
  try {
    backendProcess.kill();
  } catch {
    // ignore
  } finally {
    backendProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (process.env.ELECTRON_DEV === "1") {
    win.loadURL(FRONTEND_DEV_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.join(app.getAppPath(), "frontend", "dist", "index.html");
    win.loadFile(indexHtml);
  }
}

app.on("before-quit", () => {
  app.isQuitting = true;
  stopBackendIfRunning();
});

app.whenReady().then(() => {
  startBackendIfNeeded();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

