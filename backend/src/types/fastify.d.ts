import type { Db } from "mongodb";

type AppConfig = {
  NODE_ENV: string;
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  COOKIE_SECURE: string;
  SEARCH_PROVIDER: "brave";
  SEARCH_API_KEY?: string;
  SEARCH_MAX_RESULTS: string;
  FETCH_TIMEOUT_MS: string;
  MAX_SOURCE_CHARS: string;
  LLM_PROVIDER: "openai_compatible" | "gemini";
  LLM_MODEL: string;
  LLM_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  LLM_TIMEOUT_MS: string;
  LLM_MAX_TOKENS: string;
};

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    config: AppConfig;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; username: string };
    user: { userId: string; username: string };
  }
}

