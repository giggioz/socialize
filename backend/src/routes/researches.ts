import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { collections, type SourceDoc } from "../lib/collections.js";
import { requireAuth } from "../lib/auth.js";
import { braveWebSearch } from "../search/brave.js";
import { fetch } from "undici";
import { extractReadableText } from "../lib/extract.js";
import { createLlmClient } from "../llm/client.js";

const createResearchSchema = z.object({
  subject: z.string().min(1),
  options: z
    .object({
      maxResults: z.number().int().min(1).max(20).optional(),
      language: z.string().min(2).max(10).optional(),
    })
    .optional(),
});

export const researchesRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const body = createResearchSchema.parse(request.body);
      const { researches, sources } = collections(app.db);

      const maxResults = body.options?.maxResults ?? Number(app.config.SEARCH_MAX_RESULTS);
      const fetchTimeoutMs = Number(app.config.FETCH_TIMEOUT_MS);
      const maxSourceChars = Number(app.config.MAX_SOURCE_CHARS);

      const now = new Date();
      const research = {
        userId: request.user.userId,
        subject: body.subject,
        status: "completed" as const,
        options: {
          maxResults,
          language: body.options?.language,
        },
        createdAt: now,
        updatedAt: now,
      };

      const insertRes = await researches.insertOne(research);
      const researchId = String(insertRes.insertedId);

      try {
        if (app.config.SEARCH_PROVIDER !== "brave") {
          throw new Error(`Unsupported SEARCH_PROVIDER: ${app.config.SEARCH_PROVIDER}`);
        }
        if (!app.config.SEARCH_API_KEY) throw new Error("SEARCH_API_KEY missing");

        const results = await braveWebSearch({
          apiKey: app.config.SEARCH_API_KEY,
          query: body.subject,
          count: maxResults,
          timeoutMs: fetchTimeoutMs,
        });

        const llm = createLlmClient({
          provider: app.config.LLM_PROVIDER,
          model: app.config.LLM_MODEL,
          timeoutMs: Number(app.config.LLM_TIMEOUT_MS),
          maxTokens: Number(app.config.LLM_MAX_TOKENS),
          openai:
            app.config.OPENAI_API_KEY && app.config.LLM_BASE_URL
              ? { apiKey: app.config.OPENAI_API_KEY, baseUrl: app.config.LLM_BASE_URL }
              : undefined,
          google: app.config.GOOGLE_API_KEY ? { apiKey: app.config.GOOGLE_API_KEY } : undefined,
        });

        const fetched: Array<{
          url: string;
          title?: string;
          snippet?: string;
          extractedText?: string;
          fetchStatus: SourceDoc["fetchStatus"];
        }> = [];

        for (const r of results) {
          const abort = new AbortController();
          const t = setTimeout(() => abort.abort(), fetchTimeoutMs);
          try {
            const res = await fetch(r.url, {
              method: "GET",
              signal: abort.signal,
              headers: {
                "User-Agent": "ResearchToPostBot/1.0",
                Accept: "text/html,application/xhtml+xml",
              },
            });
            if (!res.ok) {
              fetched.push({
                url: r.url,
                title: r.title,
                snippet: r.snippet,
                fetchStatus: "error",
              });
              continue;
            }
            const html = await res.text();
            const extracted = extractReadableText(html, r.url);
            const text = extracted.text.slice(0, maxSourceChars);
            fetched.push({
              url: r.url,
              title: extracted.title ?? r.title,
              snippet: r.snippet,
              extractedText: text,
              fetchStatus: text ? "ok" : "skipped",
            });
          } catch {
            fetched.push({
              url: r.url,
              title: r.title,
              snippet: r.snippet,
              fetchStatus: "error",
            });
          } finally {
            clearTimeout(t);
          }
        }

        const json = await llm.completeJson(
          [
            {
              role: "system",
              content:
                "Sei un analista. Devi valutare rilevanza e sintetizzare fonti web per una ricerca. Rispondi in JSON.",
            },
            {
              role: "user",
              content: JSON.stringify({
                subject: body.subject,
                sources: fetched.map((f) => ({
                  url: f.url,
                  title: f.title,
                  snippet: f.snippet,
                  extractedText: f.extractedText ? f.extractedText.slice(0, 4000) : "",
                })),
                outputSchema: {
                  sources: [
                    {
                      url: "string",
                      relevanceScore: "number 0-100",
                      summary: "string",
                    },
                  ],
                },
              }),
            },
          ],
          (raw) =>
            z
              .object({
                sources: z.array(
                  z.object({
                    url: z.url(),
                    relevanceScore: z.number().min(0).max(100),
                    summary: z.string().min(1),
                  }),
                ),
              })
              .parse(raw),
          { temperature: 0.2 },
        );

        const byUrl = new Map(json.sources.map((s) => [s.url, s]));
        const docs: SourceDoc[] = fetched.map((f) => {
          const scored = byUrl.get(f.url);
          return {
            researchId,
            url: f.url,
            title: f.title,
            snippet: f.snippet,
            extractedText: f.extractedText,
            relevanceScore: scored?.relevanceScore,
            llmSummary: scored?.summary,
            includeInPost: true,
            fetchStatus: f.fetchStatus,
            createdAt: new Date(),
          };
        });

        if (docs.length) await sources.insertMany(docs);

        return reply.send({
          id: researchId,
          subject: research.subject,
          sourcesCount: docs.length,
        });
      } catch (err: unknown) {
        await researches.updateOne(
          { _id: insertRes.insertedId },
          {
            $set: {
              status: "failed",
              errorMessage:
                typeof err === "object" && err && "message" in err
                  ? (() => {
                      const m = (err as { message?: unknown }).message;
                      return typeof m === "string" && m ? m : "Unknown error";
                    })()
                  : "Unknown error",
              updatedAt: new Date(),
            },
          },
        );
        throw err;
      }
    },
  );

  app.get(
    "/",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { researches } = collections(app.db);
      const items = await researches
        .find({ userId: request.user.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return items.map((r) => ({
        id: String(r._id),
        subject: r.subject,
        status: r.status,
        createdAt: r.createdAt,
      }));
    },
  );

  app.get(
    "/:id",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const { researches, sources } = collections(app.db);
      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }
      const research = await researches.findOne({ _id: oid } as unknown as object);
      if (!research || research.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });
      const src = await sources.find({ researchId: params.id }).toArray();
      return {
        id: params.id,
        subject: research.subject,
        status: research.status,
        errorMessage: research.errorMessage,
        createdAt: research.createdAt,
        sources: src.map((s) => ({
          id: (s as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
          url: s.url,
          title: s.title,
          snippet: s.snippet,
          relevanceScore: s.relevanceScore,
          llmSummary: s.llmSummary,
          includeInPost: s.includeInPost ?? true,
          fetchStatus: s.fetchStatus,
        })),
      };
    },
  );

  app.patch(
    "/:id/sources/:sourceId",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z
        .object({ id: z.string().min(1), sourceId: z.string().min(1) })
        .parse(request.params);
      const body = z.object({ includeInPost: z.boolean() }).parse(request.body);
      const { researches, sources } = collections(app.db);

      let researchOid: ObjectId;
      try {
        researchOid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const research = await researches.findOne({ _id: researchOid } as unknown as object);
      if (!research || research.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      let sourceOid: ObjectId;
      try {
        sourceOid = new ObjectId(params.sourceId);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await sources.findOne({ _id: sourceOid } as unknown as object);
      if (existing?.researchId !== params.id)
        return reply.code(404).send({ error: "Not found" });

      await sources.updateOne(
        { _id: sourceOid } as unknown as object,
        { $set: { includeInPost: body.includeInPost } },
      );

      return reply.send({ ok: true });
    },
  );
};

