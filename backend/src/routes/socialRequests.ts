import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { collections } from "../lib/collections.js";
import { requireAuth } from "../lib/auth.js";

const createSocialRequestSchema = z.object({
  topic: z.string().min(1),
  mainQuestion: z.string().min(1),
  goalOfPost: z.enum([
    "educare",
    "convincere",
    "generare engagement",
    "autorevolezza",
    "lead",
    "commenti",
    "traffico",
  ]),
  platform: z.enum(["LinkedIn", "Instagram", "Facebook", "X"]),
  audience: z.string().min(1),
  desiredTone: z.enum([
    "professionale",
    "divulgativo",
    "caldo",
    "diretto",
    "autorevole",
    "provocatorio",
    "essenziale",
  ]),
  lengthTarget: z.enum(["corto", "medio", "lungo"]).optional(),
  ctaType: z
    .enum(["nessuna", "commento", "DM", "follow", "click", "salvataggio", "condivisione"])
    .optional(),
  angleThesis: z.string().optional(),
  whatToAvoid: z.string().optional(),
  allowedSources: z.string().optional(),
  disallowedSources: z.string().optional(),
  needHooks: z.boolean().optional(),
  needVariants: z.boolean().optional(),
  brandVoiceNotes: z.string().optional(),
  examplesOfPastPosts: z.string().optional(),
});

async function nextSequence(counters: ReturnType<typeof collections>["counters"], key: string) {
  const res = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return res?.seq ?? 1;
}

export const socialRequestsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/prompts",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          researchPrompt: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        researchPrompt: r.researchPrompt ?? "",
      }));
    },
  );

  app.get(
    "/writings",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          writingText: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        writing: r.writingText ?? "",
      }));
    },
  );

  app.get(
    "/variants",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          variantsText: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        variants: r.variantsText ?? "",
      }));
    },
  );

  app.get(
    "/reviews",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          draftPostRevised: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        review: r.draftPostRevised ?? "",
      }));
    },
  );

  app.get(
    "/deep-searches",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          deepResearchReport: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        deepSearchReport: r.deepResearchReport ?? "",
      }));
    },
  );

  app.get(
    "/distillates",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({
          userId: request.user.userId,
          distillateText: { $exists: true, $ne: "" },
        })
        .sort({ updatedAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        topic: r.topic,
        platform: r.platform,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        distillate: r.distillateText ?? "",
      }));
    },
  );

  app.get(
    "/requests",
    {
      preHandler: requireAuth,
    },
    async (request) => {
      const { socialRequests } = collections(app.db);
      const items = await socialRequests
        .find({ userId: request.user.userId })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      return items.map((r) => ({
        id: (r as { _id?: { toString?: () => string } })._id?.toString?.() ?? "",
        requestId: r.requestId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        topic: r.topic,
        mainQuestion: r.mainQuestion,
        goalOfPost: r.goalOfPost,
        platform: r.platform,
        audience: r.audience,
        desiredTone: r.desiredTone,
        lengthTarget: r.lengthTarget,
        ctaType: r.ctaType,
        angleThesis: r.angleThesis,
        whatToAvoid: r.whatToAvoid,
        allowedSources: r.allowedSources,
        disallowedSources: r.disallowedSources,
        needHooks: r.needHooks,
        needVariants: r.needVariants,
        brandVoiceNotes: r.brandVoiceNotes,
        examplesOfPastPosts: r.examplesOfPastPosts,
        status: r.status,
      }));
    },
  );

  app.post(
    "/requests/:id/writing",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ writing: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { writingText: body.writing, status: "bozza pronta", updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        writing: body.writing,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/variants",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ variants: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { variantsText: body.variants, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        variants: body.variants,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/review",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ review: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { draftPostRevised: body.review, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        review: body.review,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/deep-search-result",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ deepSearchReport: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { deepResearchReport: body.deepSearchReport, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        deepSearchReport: body.deepSearchReport,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/distillate",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ distillate: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { distillateText: body.distillate, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        distillate: body.distillate,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/deep-research-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z
        .object({
          includeScientificStrongVersion: z.boolean().optional(),
          includeBusinessStrongVersion: z.boolean().optional(),
        })
        .optional()
        .parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const angle = existing.angleThesis?.trim() ? existing.angleThesis.trim() : "-";
      const avoid = existing.whatToAvoid?.trim() ? existing.whatToAvoid.trim() : "-";
      const allowed = existing.allowedSources?.trim() ? existing.allowedSources.trim() : "-";
      const disallowed = existing.disallowedSources?.trim() ? existing.disallowedSources.trim() : "-";

      const includeScientificStrongVersion = body?.includeScientificStrongVersion === true;
      const includeBusinessStrongVersion = body?.includeBusinessStrongVersion === true;

      const prompt = [
        "Template base Deep Research",
        "Sei un ricercatore senior. Devi svolgere una ricerca approfondita e documentata.",
        "",
        "Argomento:",
        existing.topic,
        "",
        "Domanda centrale:",
        existing.mainQuestion,
        "",
        "Obiettivo del contenuto:",
        existing.goalOfPost,
        "",
        "Piattaforma finale:",
        existing.platform,
        "",
        "Pubblico:",
        existing.audience,
        "",
        "Tono desiderato:",
        existing.desiredTone,
        "",
        "Tesi o angolazione preferita:",
        angle,
        "",
        "Cose da evitare:",
        avoid,
        "",
        "Fonti ammesse o preferite:",
        allowed,
        "",
        "Fonti da evitare:",
        disallowed,
        "",
        "Istruzioni di ricerca:",
        "1. Identifica i sotto-temi necessari per rispondere bene alla domanda.",
        "2. Dai priorità a fonti primarie, autorevoli e recenti quando il tema lo richiede.",
        "3. Se ci sono dati o affermazioni controverse, mostra anche limiti, incertezze o opinioni divergenti.",
        "4. Non fermarti a definizioni generiche: cerca implicazioni pratiche, evidenze, esempi e dati comparativi.",
        "5. Se il tema è tecnico o scientifico, distingui chiaramente tra evidenze forti, moderate e deboli.",
        "6. Non scrivere ancora il post social.",
        "",
        "Formato di output richiesto:",
        "Produci un report strutturato con queste sezioni:",
        "- Sintesi esecutiva",
        "- 5-10 insight chiave",
        "- Dati o evidenze più forti",
        "- Limiti / caveat / controversie",
        "- Implicazioni pratiche",
        "- Fonti principali",
        "- 3 possibili angoli narrativi per un post social",
        "",
        "Vincoli:",
        "- Evita frasi vaghe e slogan.",
        "- Evita affermazioni non supportate.",
        "- Se un punto non è sufficientemente supportato, dillo esplicitamente.",
        "",
      ].join("\n");

      const scientificStrongVersion = [
        "Versione più forte per temi scientifici",
        "Per questo argomento, privilegia nell’ordine:",
        "1. review sistematiche e meta-analisi",
        "2. linee guida o consensus statement",
        "3. studi longitudinali o sperimentali rilevanti",
        "4. review narrative di alto livello",
        "5. fonti divulgative solo se servono per contesto",
        "",
        "Segnala sempre:",
        "- livello di evidenza",
        "- eventuali limiti metodologici",
        "- data delle fonti quando rilevante",
        "",
      ].join("\n");

      const businessStrongVersion = [
        "Versione più forte per temi business / marketing / tech",
        "Per questo argomento, privilegia nell’ordine:",
        "1. documentazione ufficiale",
        "2. report ufficiali dell’azienda o dell’ente",
        "3. fonti primarie",
        "4. testate affidabili",
        "5. articoli secondari solo per contesto",
        "",
        "Segnala sempre:",
        "- cosa è confermato",
        "- cosa è interpretazione",
        "- cosa potrebbe essere cambiato di recente",
        "",
      ].join("\n");

      const finalPrompt = [
        prompt,
        includeScientificStrongVersion ? scientificStrongVersion : "",
        includeBusinessStrongVersion ? businessStrongVersion : "",
      ]
        .filter(Boolean)
        .join("\n");

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { researchPrompt: finalPrompt, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        prompt: finalPrompt,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/distillation-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ deepResearchReport: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const angle = existing.angleThesis?.trim() ? existing.angleThesis.trim() : "-";
      const avoid = existing.whatToAvoid?.trim() ? existing.whatToAvoid.trim() : "-";
      const brandVoice = existing.brandVoiceNotes?.trim() ? existing.brandVoiceNotes.trim() : "-";
      const lengthTarget = existing.lengthTarget?.trim?.() ? existing.lengthTarget : "-";
      const ctaType = existing.ctaType?.trim?.() ? existing.ctaType : "-";

      const prompt = [
        "Prompt distillatore",
        "Sei un editor strategico. Non devi scrivere il post finale.",
        "Devi leggere il report di ricerca e trasformarlo in una scheda di lavoro sintetica, precisa e pronta per la scrittura social.",
        "",
        "Contesto del contenuto:",
        `- Piattaforma: ${existing.platform}`,
        `- Obiettivo: ${existing.goalOfPost}`,
        `- Pubblico: ${existing.audience}`,
        `- Tono: ${existing.desiredTone}`,
        `- Lunghezza target: ${lengthTarget}`,
        `- CTA: ${ctaType}`,
        `- Angolo preferito: ${angle}`,
        `- Cose da evitare: ${avoid}`,
        `- Note di stile: ${brandVoice}`,
        "",
        "Report di ricerca:",
        body.deepResearchReport,
        "",
        "Istruzioni:",
        "1. Estrai solo ciò che è davvero utile per il post.",
        "2. Elimina dettagli ridondanti, troppo tecnici o irrilevanti per il pubblico finale.",
        "3. Mantieni le cautele e i caveat essenziali.",
        '4. Se il report contiene affermazioni non ben supportate, segnale come "da non enfatizzare".',
        "5. Non scrivere in stile articolo.",
        "6. Restituisci un output strutturato.",
        "",
        "Restituisci esattamente queste sezioni:",
        "",
        "TOPIC:",
        "THESIS:",
        "AUDIENCE_PAIN:",
        "CORE_INSIGHT_1:",
        "CORE_INSIGHT_2:",
        "CORE_INSIGHT_3:",
        "OPTIONAL_INSIGHT_4:",
        "MOST_USEFUL_DATA:",
        "PRACTICAL_TAKEAWAY:",
        "CAVEAT_1:",
        "CAVEAT_2:",
        "DO_NOT_SAY:",
        "POSSIBLE_HOOK_1:",
        "POSSIBLE_HOOK_2:",
        "POSSIBLE_HOOK_3:",
        "CTA_DIRECTION:",
        "SOURCE_NOTES:",
        "",
      ].join("\n");

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        {
          $set: {
            deepResearchReport: body.deepResearchReport,
            distillationPrompt: prompt,
            updatedAt: now,
          },
        },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        prompt,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/writer-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z
        .object({
          baseMaterial: z.string().min(1).optional(),
          researchStructuredJson: z.string().min(1).optional(),
        })
        .refine((v) => Boolean(v.baseMaterial ?? v.researchStructuredJson), {
          message: "Missing base material",
          path: ["baseMaterial"],
        })
        .parse(request.body);
      const baseMaterial = body.baseMaterial ?? body.researchStructuredJson ?? "";
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const lengthTarget = existing.lengthTarget?.trim?.() ? existing.lengthTarget : "-";
      const ctaType = existing.ctaType?.trim?.() ? existing.ctaType : "-";
      const brandVoice = existing.brandVoiceNotes?.trim() ? existing.brandVoiceNotes.trim() : "-";
      const examples = existing.examplesOfPastPosts?.trim() ? existing.examplesOfPastPosts.trim() : "-";
      const avoid = existing.whatToAvoid?.trim() ? existing.whatToAvoid.trim() : "-";

      const prompt = [
        "Questo è il prompt che converte la scheda strutturata in post.",
        "Sei un social media writer senior. Devi scrivere un post nativo per la piattaforma indicata.",
        "Non devi sembrare un report, un paper o una newsletter.",
        "Devi sembrare una persona competente che scrive bene per i social.",
        "",
        "Contesto:",
        `- Piattaforma: ${existing.platform}`,
        `- Obiettivo: ${existing.goalOfPost}`,
        `- Pubblico: ${existing.audience}`,
        `- Tono: ${existing.desiredTone}`,
        `- Lunghezza target: ${lengthTarget}`,
        `- CTA: ${ctaType}`,
        `- Note di stile: ${brandVoice}`,
        `- Esempi di post passati: ${examples}`,
        "",
        "Materiale di base:",
        baseMaterial,
        "",
        "Regole di scrittura:",
        "1. Parti da una tensione, una domanda, un contrasto o un’affermazione forte ma sostenibile.",
        "2. Non usare apertura scolastica o enciclopedica.",
        '3. Non dire "secondo alcuni studi" se puoi essere più preciso.',
        "4. Non fare elenco sterile di informazioni.",
        "5. Ogni paragrafo deve far avanzare l’idea.",
        "6. Inserisci solo i dati davvero utili.",
        "7. Se ci sono caveat importanti, integrali in modo naturale.",
        "8. Scrivi per essere letto su social, non per essere pubblicato su una rivista.",
        "9. Evita cliché, frasi gonfie, tono da guru e promesse assolute.",
        `10. Evita queste cose: ${avoid}`,
        "",
        "Indicazioni di resa:",
        "- Il post deve avere un’idea centrale chiara.",
        "- Deve essere facile da leggere.",
        "- Deve avere una chiusura coerente con la CTA.",
        "- Se la piattaforma è LinkedIn o Facebook, puoi usare paragrafi brevi.",
        "- Se la piattaforma è Instagram, rendi il ritmo più compatto e memorabile.",
        "",
        "Output richiesto:",
        "Restituisci soltanto:",
        "POST:",
        "",
        "",
      ].join("\n");

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        {
          $set: {
            writerBaseMaterial: baseMaterial,
            writerPrompt: prompt,
            updatedAt: now,
          },
        },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        prompt,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/variants-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z.object({ draftPostV1: z.string().min(1) }).parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const ctaType = existing.ctaType?.trim?.() ? existing.ctaType : "-";

      const prompt = [
        "Sei un editor social. Sulla base del post già scritto, genera elementi opzionali.",
        "",
        "Contesto:",
        `- Piattaforma: ${existing.platform}`,
        `- Obiettivo: ${existing.goalOfPost}`,
        `- CTA desiderata: ${ctaType}`,
        `- Tono: ${existing.desiredTone}`,
        "",
        "Post:",
        body.draftPostV1,
        "",
        "Genera:",
        "1. 5 hook alternativi di apertura",
        "2. 3 CTA finali alternative",
        "3. 2 versioni leggermente più brevi del post",
        "4. 1 versione più diretta",
        "5. 1 versione più calda",
        "",
        "Vincoli:",
        "- Mantieni la stessa tesi di fondo",
        "- Non introdurre nuovi fatti",
        "- Non fare promesse non supportate",
        "- Non usare frasi tutte uguali tra loro",
        "",
        "Formato:",
        "HOOKS:",
        "1.",
        "2.",
        "3.",
        "4.",
        "5.",
        "",
        "CTAS:",
        "1.",
        "2.",
        "3.",
        "",
        "SHORTER_VERSIONS:",
        "1.",
        "2.",
        "",
        "DIRECT_VERSION:",
        "",
        "WARM_VERSION:",
        "",
      ].join("\n");

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        { $set: { draftPostV1: body.draftPostV1, variantsPrompt: prompt, updatedAt: now } },
      );

      return reply.send({
        id: params.id,
        requestId: existing.requestId,
        prompt,
        updatedAt: now,
      });
    },
  );

  app.post(
    "/requests/:id/reviewer-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().min(1) }).parse(request.params);
      const body = z
        .object({ baseInfo: z.string().min(1), draftPostV1: z.string().min(1) })
        .parse(request.body);
      const { socialRequests } = collections(app.db);

      let oid: ObjectId;
      try {
        oid = new ObjectId(params.id);
      } catch {
        return reply.code(404).send({ error: "Not found" });
      }

      const existing = await socialRequests.findOne({ _id: oid } as unknown as object);
      if (!existing || existing.userId !== request.user.userId)
        return reply.code(404).send({ error: "Not found" });

      const ctaType = existing.ctaType?.trim?.() ? existing.ctaType : "-";

      const prompt = [
        "Sei un revisore editoriale molto severo.",
        "Devi migliorare il post senza cambiare la tesi centrale.",
        "",
        "Contesto:",
        `- Piattaforma: ${existing.platform}`,
        `- Pubblico: ${existing.audience}`,
        `- Obiettivo: ${existing.goalOfPost}`,
        `- Tono: ${existing.desiredTone}`,
        `- CTA: ${ctaType}`,
        "",
        "Base informativa consentita:",
        body.baseInfo,
        "",
        "Bozza da revisionare:",
        body.draftPostV1,
        "",
        "Controlla questi aspetti:",
        "1. Chiarezza",
        "2. Scorrevolezza",
        "3. Aderenza ai fatti disponibili",
        "4. Assenza di cliché o formule gonfie",
        "5. Assenza di ripetizioni",
        "6. Coerenza con la piattaforma",
        "7. Forza dell’apertura",
        "8. Coerenza della chiusura",
        "",
        "Istruzioni:",
        "- Taglia il superfluo",
        "- Rendi il testo più naturale",
        "- Mantieni eventuali caveat importanti",
        "- Non introdurre nuove informazioni non presenti nella base informativa",
        '- Non rendere il tono genericamente "motivazionale" se non richiesto',
        "",
        "Output:",
        "VERSIONE_RIVISTA:",
        "BREVE_NOTA_EDITOR:",
        "",
      ].join("\n");

      const now = new Date();
      await socialRequests.updateOne(
        { _id: oid } as unknown as object,
        {
          $set: {
            researchStructuredJson: body.baseInfo,
            draftPostV1: body.draftPostV1,
            reviewerPrompt: prompt,
            updatedAt: now,
          },
        },
      );

      return reply.send({ id: params.id, requestId: existing.requestId, prompt, updatedAt: now });
    },
  );

  app.get(
    "/requests/:id/deep-research-prompt",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      return app.inject({
        method: "POST",
        url: `/social/requests/${(request.params as { id: string }).id}/deep-research-prompt`,
        headers: request.headers as Record<string, string>,
        cookies: (request as unknown as { cookies?: Record<string, string> }).cookies,
      }).then((r) => reply.code(r.statusCode).headers(r.headers).send(r.json()));
    },
  );

  app.post(
    "/requests",
    {
      preHandler: requireAuth,
    },
    async (request, reply) => {
      const body = createSocialRequestSchema.parse(request.body);
      const { socialRequests, counters } = collections(app.db);

      const now = new Date();
      const requestId = await nextSequence(counters, `social_requests:${request.user.userId}`);

      const doc = {
        userId: request.user.userId,
        requestId,
        createdAt: now,
        updatedAt: now,
        topic: body.topic,
        mainQuestion: body.mainQuestion,
        goalOfPost: body.goalOfPost,
        platform: body.platform,
        audience: body.audience,
        desiredTone: body.desiredTone,
        lengthTarget: body.lengthTarget,
        ctaType: body.ctaType,
        angleThesis: body.angleThesis,
        whatToAvoid: body.whatToAvoid,
        allowedSources: body.allowedSources,
        disallowedSources: body.disallowedSources,
        needHooks: body.needHooks ?? false,
        needVariants: body.needVariants ?? false,
        brandVoiceNotes: body.brandVoiceNotes,
        examplesOfPastPosts: body.examplesOfPastPosts,
        status: "nuovo" as const,
      };

      const insertRes = await socialRequests.insertOne(doc);
      return reply.send({
        id: String(insertRes.insertedId),
        requestId,
        createdAt: now,
      });
    },
  );
};

