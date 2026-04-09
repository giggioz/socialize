import type { FastifyPluginAsync } from "fastify";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";
import { collections, type Platform, type StyleConfig } from "../lib/collections.js";
import { createLlmClient } from "../llm/client.js";

const styleSchema = z.object({
  tone: z.enum(["professionale", "narrativo", "neutro"]),
  targetLength: z.enum(["breve", "medio", "lungo"]),
  emojis: z.boolean(),
  storytellingInstructions: z.string().max(4000),
  hashtags: z.boolean(),
});

const createPostSchema = z.object({
  platform: z.enum(["facebook", "instagram"]),
  styleConfig: styleSchema,
});

function platformGuidelines(platform: Platform): string {
  if (platform === "instagram") {
    return [
      "Piattaforma: Instagram.",
      "Testo più corto, con hook forte nelle prime 1-2 frasi.",
      "Struttura scorrevole, paragrafi brevi.",
      "Hashtag solo se richiesti dallo stile.",
    ].join("\n");
  }
  return [
    "Piattaforma: Facebook.",
    "Testo più discorsivo e leggermente più lungo rispetto a Instagram.",
    "Struttura chiara con una conclusione che invita alla riflessione.",
  ].join("\n");
}

function lengthGuidelines(target: StyleConfig["targetLength"]): string {
  if (target === "breve") return "Lunghezza: breve (circa 500-900 caratteri).";
  if (target === "lungo") return "Lunghezza: lunga (circa 1800-3000 caratteri).";
  return "Lunghezza: media (circa 1000-1800 caratteri).";
}

export const postsRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/:id/posts",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = createPostSchema.parse(request.body);
      const { researches, sources, postDrafts } = collections(app.db);

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
      const compactSources = src
        .filter((s) => (s.includeInPost ?? true) === true)
        .slice(0, 12)
        .map((s) => ({
          url: s.url,
          title: s.title,
          snippet: s.snippet,
          relevanceScore: s.relevanceScore,
          summary: s.llmSummary,
        }))
        .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

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

      const system = [
        "Sei un copywriter professionale per social.",
        "Devi scrivere un post in stile storytelling basato sulle fonti fornite.",
        "Non inventare fatti non presenti nelle fonti; se manca una parte, restare generico.",
        platformGuidelines(body.platform),
        lengthGuidelines(body.styleConfig.targetLength),
        body.styleConfig.emojis ? "Emoji: consentite con moderazione." : "Emoji: non usare emoji.",
        body.styleConfig.hashtags ? "Hashtag: consentiti a fine post." : "Hashtag: non includere hashtag.",
      ].join("\n");

      const user = [
        `Subject: ${research.subject}`,
        "",
        "Stile richiesto dall'utente (istruzioni):",
        body.styleConfig.storytellingInstructions.trim() || "(nessuna istruzione aggiuntiva)",
        "",
        "Fonti (sintesi e punteggio):",
        JSON.stringify(compactSources, null, 2),
        "",
        "Scrivi solo il testo del post (nessun titolo separato, nessun JSON).",
      ].join("\n");

      const post = await llm.complete(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { temperature: body.styleConfig.tone === "neutro" ? 0.2 : 0.5 },
      );

      const clean = post.trim();
      const doc = {
        researchId: params.id,
        userId: request.user.userId,
        platform: body.platform as Platform,
        styleConfig: body.styleConfig,
        body: clean,
        charCount: clean.length,
        createdAt: new Date(),
      };
      const ins = await postDrafts.insertOne(doc);

      return reply.send({
        id: String(ins.insertedId),
        researchId: params.id,
        platform: body.platform,
        body: clean,
        charCount: clean.length,
        createdAt: doc.createdAt,
      });
    },
  );
};

