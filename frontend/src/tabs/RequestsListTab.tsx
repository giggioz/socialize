import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import type { SocialRequestListItem } from "../api";

export type RequestsListTabProps = Readonly<{
  srListLoading: boolean;
  srList: SocialRequestListItem[];
  selectedContextId: string;

  drPromptLoading: boolean;
  drPromptText: string;
  setDrPromptText: (v: string) => void;
  drIncludeScientificStrongVersion: boolean;
  setDrIncludeScientificStrongVersion: (v: boolean) => void;
  drIncludeBusinessStrongVersion: boolean;
  setDrIncludeBusinessStrongVersion: (v: boolean) => void;
  setDrPromptLoading: (v: boolean) => void;

  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  refreshSocialRequests: () => Promise<void>;
  refreshPrompts: () => Promise<void>;
  generateDeepResearchPrompt: (
    requestId: string,
    opts: { includeScientificStrongVersion: boolean; includeBusinessStrongVersion: boolean },
  ) => Promise<{ prompt: string }>;
}>;

export function RequestsListTab(props: RequestsListTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Contesti
            </Typography>
            <Button
              variant="outlined"
              disabled={props.srListLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshSocialRequests();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Requests");
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
                Questa è la collezione di <b>tutte le Request create</b>. Selezionane una per vedere i dettagli e generare il{" "}
                <b>prompt di Deep Research</b>.
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>1) Seleziona</b> una Request dalla lista
                  </li>
                  <li>
                    <b>2) Genera</b> il prompt con “Genera prompt Deep Research” (verrà anche salvato nel tab{" "}
                    <b>Prompts Deep Search</b>)
                  </li>
                  <li>
                    <b>3) Copia</b> e <b>incolla</b> il prompt dentro ChatGPT per avviare la ricerca
                  </li>
                </ul>
              </Typography>
            </Stack>
          </Alert>

          {props.srListLoading ? <LinearProgress /> : null}

          {props.srList.length ? null : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessuna request ancora.
            </Typography>
          )}

          {(() => {
            const selected = props.srList.find((r) => r.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">
                      Request #{selected.requestId} · {selected.status}
                    </Typography>
                    <Typography variant="subtitle2">Topic</Typography>
                    <Typography variant="body2">{selected.topic}</Typography>
                    <Typography variant="subtitle2">Main question</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {selected.mainQuestion}
                    </Typography>
                    <Divider />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Platform: {selected.platform}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Goal: {selected.goalOfPost}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Tone: {selected.desiredTone}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Length: {selected.lengthTarget ?? "-"}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        CTA: {selected.ctaType ?? "-"}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2">Audience</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {selected.audience}
                    </Typography>
                    {selected.angleThesis ? (
                      <>
                        <Typography variant="subtitle2">Angle / thesis</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.angleThesis}
                        </Typography>
                      </>
                    ) : null}
                    {selected.whatToAvoid ? (
                      <>
                        <Typography variant="subtitle2">What to avoid</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.whatToAvoid}
                        </Typography>
                      </>
                    ) : null}
                    {selected.allowedSources ? (
                      <>
                        <Typography variant="subtitle2">Allowed sources</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.allowedSources}
                        </Typography>
                      </>
                    ) : null}
                    {selected.disallowedSources ? (
                      <>
                        <Typography variant="subtitle2">Disallowed sources</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.disallowedSources}
                        </Typography>
                      </>
                    ) : null}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Need hooks: {selected.needHooks ? "sì" : "no"}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Need variants: {selected.needVariants ? "sì" : "no"}
                      </Typography>
                    </Stack>
                    {selected.brandVoiceNotes ? (
                      <>
                        <Typography variant="subtitle2">Brand voice notes</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.brandVoiceNotes}
                        </Typography>
                      </>
                    ) : null}
                    {selected.examplesOfPastPosts ? (
                      <>
                        <Typography variant="subtitle2">Examples of past posts</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {selected.examplesOfPastPosts}
                        </Typography>
                      </>
                    ) : null}

                    <Divider />

                    {props.drPromptLoading ? <LinearProgress /> : null}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={props.drIncludeScientificStrongVersion}
                            onChange={(e) => props.setDrIncludeScientificStrongVersion(e.target.checked)}
                          />
                        }
                        label="Includi versione forte (scientifico)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={props.drIncludeBusinessStrongVersion}
                            onChange={(e) => props.setDrIncludeBusinessStrongVersion(e.target.checked)}
                          />
                        }
                        label="Includi versione forte (business/marketing/tech)"
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        disabled={props.drPromptLoading}
                        onClick={async () => {
                          props.clearError();
                          props.setDrPromptText("");
                          props.setDrPromptLoading(true);
                          try {
                            const res = await props.generateDeepResearchPrompt(selected.id, {
                              includeScientificStrongVersion: props.drIncludeScientificStrongVersion,
                              includeBusinessStrongVersion: props.drIncludeBusinessStrongVersion,
                            });
                            props.setDrPromptText(res.prompt);
                            await props.refreshPrompts();
                          } catch (e: unknown) {
                            props.onError(e, "Errore generazione prompt");
                          } finally {
                            props.setDrPromptLoading(false);
                          }
                        }}
                      >
                        Genera prompt Deep Research
                      </Button>

                      <Button
                        variant="outlined"
                        disabled={!props.drPromptText}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(props.drPromptText);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia prompt
                      </Button>
                    </Stack>

                    {props.drPromptText ? (
                      <TextField
                        label="Prompt Deep Research"
                        value={props.drPromptText}
                        fullWidth
                        multiline
                        minRows={10}
                      />
                    ) : null}
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

