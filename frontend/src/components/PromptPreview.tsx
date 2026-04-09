import { Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import type { StyleConfig } from "../api";

type SourceItem = {
  url: string;
  title?: string;
  snippet?: string;
  relevanceScore?: number;
  llmSummary?: string;
  includeInPost?: boolean;
};

function platformGuidelines(platform: "facebook" | "instagram"): string {
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

function buildCompactSources(sources: SourceItem[]) {
  return sources
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
}

export function PromptPreview(
  props: Readonly<{
    subject: string;
    platform: "facebook" | "instagram";
    styleConfig: StyleConfig;
    sources: SourceItem[];
  }>,
) {
  const compactSources = buildCompactSources(props.sources);

  const system = [
    "Sei un copywriter professionale per social.",
    "Devi scrivere un post in stile storytelling basato sulle fonti fornite.",
    "Non inventare fatti non presenti nelle fonti; se manca una parte, restare generico.",
    platformGuidelines(props.platform),
    lengthGuidelines(props.styleConfig.targetLength),
    props.styleConfig.emojis ? "Emoji: consentite con moderazione." : "Emoji: non usare emoji.",
    props.styleConfig.hashtags ? "Hashtag: consentiti a fine post." : "Hashtag: non includere hashtag.",
  ].join("\n");

  const user = [
    `Subject: ${props.subject}`,
    "",
    "Stile richiesto dall'utente (istruzioni):",
    props.styleConfig.storytellingInstructions.trim() || "(nessuna istruzione aggiuntiva)",
    "",
    "Fonti (sintesi e punteggio):",
    JSON.stringify(compactSources, null, 2),
    "",
    "Scrivi solo il testo del post (nessun titolo separato, nessun JSON).",
  ].join("\n");

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Anteprima prompt</Typography>
          <TextField
            label="system"
            value={system}
            multiline
            minRows={6}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            label="user"
            value={user}
            multiline
            minRows={10}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            Fonti incluse: {compactSources.length} / {props.sources.length} (max 12)
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

