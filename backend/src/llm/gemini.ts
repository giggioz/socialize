import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompleteOptions, LlmClient, LlmMessage } from "./types.js";

export function createGeminiClient(params: {
  apiKey: string;
  model: string;
  defaultTimeoutMs: number;
  defaultMaxTokens: number;
}): LlmClient {
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({ model: params.model });

  async function complete(messages: LlmMessage[], options?: CompleteOptions): Promise<string> {
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const userText = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const timeoutMs = options?.timeoutMs ?? params.defaultTimeoutMs;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await model.generateContent(
        {
          contents: [
            {
              role: "user",
              parts: [{ text: system ? `${system}\n\n${userText}` : userText }],
            },
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? params.defaultMaxTokens,
          },
        },
        { signal: controller.signal } as unknown as { signal: AbortSignal },
      );

      const text = res.response.text();
      return text;
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
        { role: "user", content: "Rispondi ESCLUSIVAMENTE con JSON valido (no markdown)." },
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

