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
import type { SocialPromptListItem } from "../api";
import { copyTextToClipboard } from "../clipboard";

export type PromptsTabProps = Readonly<{
  promptsLoading: boolean;
  prompts: SocialPromptListItem[];
  selectedContextId: string;
  deepSearchResultText: string;
  setDeepSearchResultText: (v: string) => void;
  deepSearchResultSaving: boolean;
  saveDeepSearchResult: (requestMongoId: string, deepSearchReport: string) => Promise<void>;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshPrompts: () => Promise<void>;
}>;

export function PromptsTab(props: PromptsTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Prompts creati
            </Typography>
            <Button
              variant="outlined"
              disabled={props.promptsLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshPrompts();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Prompts");
                }
              }}
            >
              Aggiorna
            </Button>
          </Stack>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">A cosa serve</Typography>
              <Typography variant="body2">
                Qui trovi la <b>lista dei prompt per la Deep Search</b> già generati e salvati. Selezionane uno, copialo e{" "}
                <b>incollalo in ChatGPT</b> per avviare la ricerca.
              </Typography>
            </Stack>
          </Alert>

          {props.promptsLoading ? <LinearProgress /> : null}

          {!props.prompts.length ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessun prompt ancora.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.prompts.find((p) => p.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Prompt per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await copyTextToClipboard(selected.researchPrompt);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField label="Prompt" value={selected.researchPrompt} fullWidth multiline minRows={12} />

                    <TextField
                      label="Risultato Deep Search (report)"
                      value={props.deepSearchResultText}
                      onChange={(e) => props.setDeepSearchResultText(e.target.value)}
                      fullWidth
                      multiline
                      minRows={12}
                      placeholder="Dopo la Deep Search in ChatGPT, incolla qui il report completo."
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        disabled={!props.deepSearchResultText.trim() || props.deepSearchResultSaving}
                        onClick={async () => {
                          props.clearError();
                          try {
                            await props.saveDeepSearchResult(props.selectedContextId, props.deepSearchResultText.trim());
                          } catch (e: unknown) {
                            props.onError(e, "Errore salvataggio deep search");
                          }
                        }}
                      >
                        Salva in DEEP SEARCHES
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={!props.deepSearchResultText}
                        onClick={async () => {
                          try {
                            await copyTextToClipboard(props.deepSearchResultText);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia report
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}
        </Stack>
      </CardContent>
    </Card>
  );
}

