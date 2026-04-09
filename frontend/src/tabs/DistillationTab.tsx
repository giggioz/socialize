import {
  Alert,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export type DistillationTabProps = Readonly<{
  selectedContextId: string;
  deepResearchReport: string;
  setDeepResearchReport: (v: string) => void;
  distillPromptLoading: boolean;
  distillPromptText: string;
  setDistillPromptText: (v: string) => void;
  setDistillPromptLoading: (v: boolean) => void;
  distillateText: string;
  setDistillateText: (v: string) => void;
  distillateSaving: boolean;

  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  generateDistillationPrompt: (requestId: string, report: string) => Promise<{ prompt: string }>;
  saveDistillate: (requestId: string, distillateText: string) => Promise<void>;
}>;

export function DistillationTab(props: DistillationTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Distillazione</Typography>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">A cosa serve</Typography>
              <Typography variant="body2">
                Questo tab trasforma il <b>report completo</b> della Deep Research in un <b>prompt di distillazione</b>:
                serve a estrarre solo i punti davvero utili (insight, dati, esempi, fonti) in un formato pronto per i passaggi
                successivi (scrittura/varianti/revisione).
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>

                  <li>
                    <b>1) Incolla</b> qui sotto il report completo della Deep Research
                  </li>
                  <li>
                    <b>2) Genera</b> il prompt con “Genera prompt distillatore”
                  </li>
                  <li>
                    <b>3) Copia</b> il prompt e <b>incollalo in ChatGPT</b> per ottenere la distillazione
                  </li>
                </ul>
              </Typography>
            </Stack>
          </Alert>

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto nel tab CONTESTI.
            </Typography>
          ) : null}

          <TextField
            label="Deep research report"
            value={props.deepResearchReport}
            onChange={(e) => props.setDeepResearchReport(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            placeholder="Incolla qui il report completo ottenuto dalla Deep Research."
          />

          {props.distillPromptLoading ? <LinearProgress /> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.deepResearchReport.trim() || props.distillPromptLoading}
              onClick={async () => {
                props.clearError();
                props.setDistillPromptText("");
                props.setDistillPromptLoading(true);
                try {
                  const res = await props.generateDistillationPrompt(
                    props.selectedContextId,
                    props.deepResearchReport.trim(),
                  );
                  props.setDistillPromptText(res.prompt);
                } catch (e: unknown) {
                  props.onError(e, "Errore generazione prompt distillatore");
                } finally {
                  props.setDistillPromptLoading(false);
                }
              }}
            >
              Genera prompt distillatore
            </Button>

            <Button
              variant="outlined"
              disabled={!props.distillPromptText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.distillPromptText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia prompt
            </Button>
          </Stack>

          {props.distillPromptText ? (
            <TextField
              label="Prompt distillatore"
              value={props.distillPromptText}
              fullWidth
              multiline
              minRows={16}
            />
          ) : null}

          <TextField
            label="Distillato (risultato)"
            value={props.distillateText}
            onChange={(e) => props.setDistillateText(e.target.value)}
            fullWidth
            multiline
            minRows={12}
            placeholder="Dopo aver eseguito il prompt in ChatGPT, incolla qui il risultato finale della distillazione."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.distillateText.trim() || props.distillateSaving}
              onClick={async () => {
                props.clearError();
                try {
                  await props.saveDistillate(props.selectedContextId, props.distillateText.trim());
                } catch (e: unknown) {
                  props.onError(e, "Errore salvataggio distillato");
                }
              }}
            >
              Salva nei Distillati
            </Button>
            <Button
              variant="outlined"
              disabled={!props.distillateText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.distillateText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia distillato
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

