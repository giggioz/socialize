import { fetch } from "undici";

export type SearchResult = {
  url: string;
  title?: string;
  snippet?: string;
};

export async function braveWebSearch(params: {
  apiKey: string;
  query: string;
  count: number;
  timeoutMs: number;
}): Promise<SearchResult[]> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), params.timeoutMs);
  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", params.query);
    url.searchParams.set("count", String(params.count));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": params.apiKey,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Brave search error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as unknown;
    const items =
      typeof data === "object" && data
        ? (((data as { web?: { results?: unknown[] } }).web?.results ?? []) as unknown[])
        : ([] as unknown[]);
    return items
      .map((r) => {
        const obj = r as Record<string, unknown>;
        return {
          url: typeof obj.url === "string" ? obj.url : "",
          title: typeof obj.title === "string" ? obj.title : undefined,
          snippet: typeof obj.description === "string" ? obj.description : undefined,
        };
      })
      .filter((r) => r.url);
  } finally {
    clearTimeout(t);
  }
}

