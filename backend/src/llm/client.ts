import type { LlmClient, LlmProvider } from "./types.js";
import { createOpenAiCompatibleClient } from "./openai-compatible.js";
import { createGeminiClient } from "./gemini.js";

export function createLlmClient(config: {
  provider: LlmProvider;
  model: string;
  timeoutMs: number;
  maxTokens: number;
  openai?: { apiKey: string; baseUrl: string };
  google?: { apiKey: string };
}): LlmClient {
  if (config.provider === "openai_compatible") {
    if (!config.openai?.apiKey) throw new Error("OPENAI_API_KEY missing");
    if (!config.openai?.baseUrl) throw new Error("LLM_BASE_URL missing");
    return createOpenAiCompatibleClient({
      apiKey: config.openai.apiKey,
      baseUrl: config.openai.baseUrl,
      model: config.model,
      defaultTimeoutMs: config.timeoutMs,
      defaultMaxTokens: config.maxTokens,
    });
  }

  if (config.provider === "gemini") {
    if (!config.google?.apiKey) throw new Error("GOOGLE_API_KEY missing");
    return createGeminiClient({
      apiKey: config.google.apiKey,
      model: config.model,
      defaultTimeoutMs: config.timeoutMs,
      defaultMaxTokens: config.maxTokens,
    });
  }

  throw new Error(`Unsupported LLM provider: ${config.provider}`);
}

