import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import env from "@fastify/env";
import sensible from "@fastify/sensible";
import { createDb } from "./lib/db.js";
import { authRoutes } from "./routes/auth.js";
import { researchesRoutes } from "./routes/researches.js";
import { postsRoutes } from "./routes/posts.js";
import { socialRequestsRoutes } from "./routes/socialRequests.js";

const app = Fastify({
  logger: true,
});

await app.register(env, {
  dotenv: true,
  schema: {
    type: "object",
    required: [
      "NODE_ENV",
      "PORT",
      "MONGODB_URI",
      "JWT_SECRET",
      "CORS_ORIGIN",
      "COOKIE_SECURE",
      "SEARCH_PROVIDER",
      "SEARCH_MAX_RESULTS",
      "FETCH_TIMEOUT_MS",
      "MAX_SOURCE_CHARS",
      "LLM_PROVIDER",
      "LLM_MODEL",
      "LLM_TIMEOUT_MS",
      "LLM_MAX_TOKENS",
    ],
    properties: {
      NODE_ENV: { type: "string" },
      PORT: { type: "string" },
      MONGODB_URI: { type: "string" },
      JWT_SECRET: { type: "string" },
      CORS_ORIGIN: { type: "string" },
      COOKIE_SECURE: { type: "string" },
      SEARCH_PROVIDER: { type: "string" },
      SEARCH_API_KEY: { type: "string" },
      SEARCH_MAX_RESULTS: { type: "string" },
      FETCH_TIMEOUT_MS: { type: "string" },
      MAX_SOURCE_CHARS: { type: "string" },
      LLM_PROVIDER: { type: "string" },
      LLM_MODEL: { type: "string" },
      LLM_BASE_URL: { type: "string" },
      OPENAI_API_KEY: { type: "string" },
      GOOGLE_API_KEY: { type: "string" },
      LLM_TIMEOUT_MS: { type: "string" },
      LLM_MAX_TOKENS: { type: "string" },
    },
  },
});

await app.register(cors, {
  origin: (origin, cb) => {
    const allowed = (app.config.CORS_ORIGIN ?? "").split(",").map((s: string) => s.trim());
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS not allowed"), false);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});
await app.register(helmet);
await app.register(cookie);
await app.register(jwt, {
  secret: app.config.JWT_SECRET,
  cookie: {
    cookieName: "token",
    signed: false,
  },
});
await app.register(sensible);

const db = await createDb(app.config.MONGODB_URI);
app.decorate("db", db);

await app.register(authRoutes, { prefix: "/auth" });
await app.register(researchesRoutes, { prefix: "/researches" });
await app.register(postsRoutes, { prefix: "/researches" });
await app.register(socialRequestsRoutes, { prefix: "/social" });

app.get("/health", async () => ({ ok: true }));

const port = Number(app.config.PORT);
await app.listen({ port, host: "0.0.0.0" });

