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

export type WriterTabProps = Readonly<{
  selectedContextId: string;
  writerBaseMaterial: string;
  setWriterBaseMaterial: (v: string) => void;
  writerResultText: string;
  setWriterResultText: (v: string) => void;
  writerResultSaving: boolean;
  saveWriterResult: (requestMongoId: string, writing: string) => Promise<void>;
  writerPromptLoading: boolean;
  writerPromptText: string;
  setWriterPromptText: (v: string) => void;
  setWriterPromptLoading: (v: boolean) => void;

  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  generateWriterPrompt: (requestId: string, baseMaterial: string) => Promise<{ prompt: string }>;
}>;

export function WriterTab(props: WriterTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Scrittura</Typography>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">A cosa serve</Typography>
              <Typography variant="body2">
                Questo tab genera il <b>prompt “writer”</b> per trasformare il materiale di base (distillato, note, estratti,
                JSON) in una <b>bozza di post (v1)</b> coerente con la Request selezionata.
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>1) Seleziona</b> la Request
                  </li>
                  <li>
                    <b>2) Incolla</b> il materiale di base (tipicamente un distillato)
                  </li>
                  <li>
                    <b>3) Genera</b> e <b>copia</b> il prompt, poi incollalo in ChatGPT per ottenere la bozza
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
            label="Distillato"
            value={props.writerBaseMaterial}
            onChange={(e) => props.setWriterBaseMaterial(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            placeholder="Incolla qui qualunque materiale: JSON, scheda distillata, note, estratti, ecc."
          />

          {props.writerPromptLoading ? <LinearProgress /> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.writerBaseMaterial.trim() || props.writerPromptLoading}
              onClick={async () => {
                props.clearError();
                props.setWriterPromptText("");
                props.setWriterPromptLoading(true);
                try {
                  const res = await props.generateWriterPrompt(props.selectedContextId, props.writerBaseMaterial.trim());
                  props.setWriterPromptText(res.prompt);
                } catch (e: unknown) {
                  props.onError(e, "Errore generazione prompt writer");
                } finally {
                  props.setWriterPromptLoading(false);
                }
              }}
            >
              Genera prompt writer
            </Button>

            <Button
              variant="outlined"
              disabled={!props.writerPromptText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.writerPromptText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia prompt
            </Button>
          </Stack>

          {props.writerPromptText ? (
            <TextField label="Prompt writer" value={props.writerPromptText} fullWidth multiline minRows={16} />
          ) : null}

          <TextField
            label="Risultato (output ChatGPT)"
            value={props.writerResultText}
            onChange={(e) => props.setWriterResultText(e.target.value)}
            fullWidth
            multiline
            minRows={12}
            placeholder="Dopo aver eseguito il prompt in ChatGPT, incolla qui il post (bozza v1)."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.writerResultText.trim() || props.writerResultSaving}
              onClick={async () => {
                props.clearError();
                try {
                  await props.saveWriterResult(props.selectedContextId, props.writerResultText.trim());
                } catch (e: unknown) {
                  props.onError(e, "Errore salvataggio writing");
                }
              }}
            >
              Salva in WRITINGS
            </Button>
            <Button
              variant="outlined"
              disabled={!props.writerResultText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.writerResultText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia writing
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

