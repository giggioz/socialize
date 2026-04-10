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
import { copyTextToClipboard } from "../clipboard";

export type VariantsTabProps = Readonly<{
  selectedContextId: string;
  draftPostV1: string;
  setDraftPostV1: (v: string) => void;
  variantsResultText: string;
  setVariantsResultText: (v: string) => void;
  variantsResultSaving: boolean;
  saveVariantsResult: (requestMongoId: string, variants: string) => Promise<void>;
  variantsPromptLoading: boolean;
  variantsPromptText: string;
  setVariantsPromptText: (v: string) => void;
  setVariantsPromptLoading: (v: boolean) => void;

  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  generateVariantsPrompt: (requestId: string, draft: string) => Promise<{ prompt: string }>;
}>;

export function VariantsTab(props: VariantsTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Varianti</Typography>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">A cosa serve</Typography>
              <Typography variant="body2">
                Qui generi il <b>prompt “varianti”</b> per ottenere più riscritture della bozza (v1) mantenendo obiettivo,
                piattaforma e tono della Request.
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>1) Seleziona</b> la Request
                  </li>
                  <li>
                    <b>2) Incolla</b> la bozza v1 (dal tab Scrittura)
                  </li>
                  <li>
                    <b>3) Genera</b> e <b>copia</b> il prompt, poi incollalo in ChatGPT per ottenere le varianti
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
            label="Draft post v1"
            value={props.draftPostV1}
            onChange={(e) => props.setDraftPostV1(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            placeholder="Incolla qui il post già scritto."
          />

          {props.variantsPromptLoading ? <LinearProgress /> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.draftPostV1.trim() || props.variantsPromptLoading}
              onClick={async () => {
                props.clearError();
                props.setVariantsPromptText("");
                props.setVariantsPromptLoading(true);
                try {
                  const res = await props.generateVariantsPrompt(props.selectedContextId, props.draftPostV1.trim());
                  props.setVariantsPromptText(res.prompt);
                } catch (e: unknown) {
                  props.onError(e, "Errore generazione prompt varianti");
                } finally {
                  props.setVariantsPromptLoading(false);
                }
              }}
            >
              Genera prompt varianti
            </Button>

            <Button
              variant="outlined"
              disabled={!props.variantsPromptText}
              onClick={async () => {
                try {
                  await copyTextToClipboard(props.variantsPromptText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia prompt
            </Button>
          </Stack>

          {props.variantsPromptText ? (
            <TextField label="Prompt varianti" value={props.variantsPromptText} fullWidth multiline minRows={16} />
          ) : null}

          <TextField
            label="Risultato (output ChatGPT)"
            value={props.variantsResultText}
            onChange={(e) => props.setVariantsResultText(e.target.value)}
            fullWidth
            multiline
            minRows={14}
            placeholder="Dopo aver eseguito il prompt in ChatGPT, incolla qui il risultato completo (hooks/CTA/versioni)."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.variantsResultText.trim() || props.variantsResultSaving}
              onClick={async () => {
                props.clearError();
                try {
                  await props.saveVariantsResult(props.selectedContextId, props.variantsResultText.trim());
                } catch (e: unknown) {
                  props.onError(e, "Errore salvataggio varianti");
                }
              }}
            >
              Salva in VARIANTS
            </Button>
            <Button
              variant="outlined"
              disabled={!props.variantsResultText}
              onClick={async () => {
                try {
                  await copyTextToClipboard(props.variantsResultText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia varianti
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

