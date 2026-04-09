export type LlmProvider = "openai_compatible" | "gemini";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompleteOptions = {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export type LlmClient = {
  complete(messages: LlmMessage[], options?: CompleteOptions): Promise<string>;
  completeJson<T>(
    messages: LlmMessage[],
    parse: (raw: unknown) => T,
    options?: CompleteOptions,
  ): Promise<T>;
};

