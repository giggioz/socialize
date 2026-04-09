import { fetch } from "undici";
import type { CompleteOptions, LlmClient, LlmMessage } from "./types.js";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

export function createOpenAiCompatibleClient(params: {
  apiKey: string;
  baseUrl: string;
  model: string;
  defaultTimeoutMs: number;
  defaultMaxTokens: number;
}): LlmClient {
  const base = params.baseUrl.replace(/\/$/, "");

  async function complete(messages: LlmMessage[], options?: CompleteOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? params.defaultTimeoutMs;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? params.defaultMaxTokens,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM error ${res.status}: ${text}`);
      }
      const data = (await res.json()) as OpenAIChatResponse;
      const content = data.choices?.[0]?.message?.content ?? "";
      return content;
    } finally {
      clearTimeout(t);
    }
  }

  async function completeJson<T>(
    messages: LlmMessage[],
    parse: (raw: unknown) => T,
    options?: CompleteOptions,
  ): Promise<T> {
    const rawText = await complete(
      [
        ...messages,
        {
          role: "user",
          content:
            "Rispondi ESCLUSIVAMENTE con JSON valido (nessun testo extra, nessun markdown).",
        },
      ],
      options,
    );

    const trimmed = rawText.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    const candidate =
      jsonStart !== -1 && jsonEnd !== -1 ? trimmed.slice(jsonStart, jsonEnd + 1) : trimmed;
    const parsed = JSON.parse(candidate) as unknown;
    return parse(parsed);
  }

  return { complete, completeJson };
}

