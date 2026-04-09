import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export function RulesTab() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Regole</Typography>

          <Stack spacing={1}>
            <Typography variant="subtitle1">Quando compili il form, usa questa struttura mentale</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Argomento{"\n"}- di cosa si parla
              {"\n\n"}Domanda{"\n"}- cosa vuoi capire davvero
              {"\n\n"}Tesi{"\n"}- quale idea vuoi far emergere
              {"\n\n"}Pubblico{"\n"}- chi deve sentirsi chiamato in causa
              {"\n\n"}Trasformazione{"\n"}- cosa deve pensare o fare dopo aver letto
              {"\n\n"}Vincoli{"\n"}- cosa non vuoi assolutamente
              {"\n\n"}Esempio:
              {"\n"}Argomento: sonno e prestazione negli adolescenti sportivi
              {"\n"}Domanda: quali interventi semplici hanno evidenza ragionevole?
              {"\n"}Tesi: piccoli interventi ben scelti aiutano più di consigli generici
              {"\n"}Pubblico: allenatori e genitori
              {"\n"}Trasformazione: smettere di dare raccomandazioni vaghe
              {"\n"}Vincoli: no tono accademico, no terrorismo, no promesse assolute
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Output finali che ti conviene generare ogni volta</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Non produrre solo un testo. Fai produrre sempre:
              {"\n"}- 1 post principale
              {"\n"}- 5 hook
              {"\n"}- 3 CTA
              {"\n"}- 2 versioni più brevi
              {"\n"}- 1 versione più diretta
              {"\n"}- 1 versione più calda
              {"\n"}- 1 mini-riassunto interno del contenuto
              {"\n\n"}Quest’ultimo serve come archivio e ti aiuta a riusare il contenuto.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 1: separa sempre i ruoli</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Non usare un unico prompt per:
              {"\n"}- ricercare
              {"\n"}- sintetizzare
              {"\n"}- scrivere
              {"\n"}- revisionare
              {"\n\n"}Un ruolo = un compito.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 2: passa sempre dal “research brief”</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Mai dare il report completo direttamente al writer senza averlo distillato.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 3: inserisci sempre “cose da evitare”</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              È uno dei campi più utili in assoluto.
              {"\n\n"}Esempi:
              {"\n"}- non usare tono da coach motivazionale
              {"\n"}- non sembrare accademico
              {"\n"}- non usare emoji
              {"\n"}- non fare domande finali banali
              {"\n"}- non usare “oggi più che mai”
              {"\n"}- non usare “è fondamentale”
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 4: dai esempi di stile</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Nel campo Examples of past posts, incolla 1 o 2 post tuoi ben riusciti.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 5: non chiedere mai “scrivi un post virale”</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Meglio:
              {"\n"}- genera un’apertura ad alta tensione cognitiva
              {"\n"}- genera un post con contrasto iniziale
              {"\n"}- genera un post che faccia sentire il problema in modo concreto
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1">Regola 6: definisci il pubblico in modo situazionale</Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              Non scrivere “professionisti”. Scrivi:
              {"\n"}- psicologi che pubblicano contenuti divulgativi su LinkedIn
              {"\n"}- genitori interessati a sonno e sport giovanile
              {"\n"}- piccoli imprenditori che cercano idee operative, non teoria
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

