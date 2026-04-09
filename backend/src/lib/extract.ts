import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export function extractReadableText(html: string, url: string): { title?: string; text: string } {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();
  if (!parsed) return { text: "" };

  const text = parsed.textContent ?? "";
  return { title: parsed.title ?? undefined, text };
}

