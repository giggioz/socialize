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

export type ReviewerTabProps = Readonly<{
  selectedContextId: string;
  reviewerBaseInfo: string;
  setReviewerBaseInfo: (v: string) => void;
  reviewerDraftPostV1: string;
  setReviewerDraftPostV1: (v: string) => void;
  reviewerResultText: string;
  setReviewerResultText: (v: string) => void;
  reviewerResultSaving: boolean;
  saveReviewerResult: (requestMongoId: string, review: string) => Promise<void>;
  reviewerPromptLoading: boolean;
  reviewerPromptText: string;
  setReviewerPromptText: (v: string) => void;
  setReviewerPromptLoading: (v: boolean) => void;

  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  generateReviewerPrompt: (requestId: string, baseInfo: string, draft: string) => Promise<{ prompt: string }>;
}>;

export function ReviewerTab(props: ReviewerTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Revisione</Typography>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">A cosa serve</Typography>
              <Typography variant="body2">
                Questo tab genera il <b>prompt “revisore”</b> per migliorare la bozza v1: chiarezza, struttura, scorrevolezza,
                CTA e aderenza al distillato (riducendo il rischio di aggiungere dettagli non supportati).
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>1) Seleziona</b> la Request
                  </li>
                  <li>
                    <b>2) Incolla</b> distillato
                  </li>
                  <li>
                    <b>3) Incolla</b> la bozza v1 e <b>genera</b> il prompt
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
            value={props.reviewerBaseInfo}
            onChange={(e) => props.setReviewerBaseInfo(e.target.value)}
            fullWidth
            multiline
            minRows={8}
            placeholder="Incolla qui il distillato (o materiale equivalente)."
          />

          <TextField
            label="Bozza da revisionare (Draft post v1)"
            value={props.reviewerDraftPostV1}
            onChange={(e) => props.setReviewerDraftPostV1(e.target.value)}
            fullWidth
            multiline
            minRows={8}
            placeholder="Incolla qui la bozza da revisionare."
          />

          {props.reviewerPromptLoading ? <LinearProgress /> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={
                !props.selectedContextId ||
                !props.reviewerBaseInfo.trim() ||
                !props.reviewerDraftPostV1.trim() ||
                props.reviewerPromptLoading
              }
              onClick={async () => {
                props.clearError();
                props.setReviewerPromptText("");
                props.setReviewerPromptLoading(true);
                try {
                  const res = await props.generateReviewerPrompt(
                    props.selectedContextId,
                    props.reviewerBaseInfo.trim(),
                    props.reviewerDraftPostV1.trim(),
                  );
                  props.setReviewerPromptText(res.prompt);
                } catch (e: unknown) {
                  props.onError(e, "Errore generazione prompt revisore");
                } finally {
                  props.setReviewerPromptLoading(false);
                }
              }}
            >
              Genera prompt revisore
            </Button>

            <Button
              variant="outlined"
              disabled={!props.reviewerPromptText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.reviewerPromptText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia prompt
            </Button>
          </Stack>

          {props.reviewerPromptText ? (
            <TextField label="Prompt revisore" value={props.reviewerPromptText} fullWidth multiline minRows={16} />
          ) : null}

          <TextField
            label="Risultato (output ChatGPT)"
            value={props.reviewerResultText}
            onChange={(e) => props.setReviewerResultText(e.target.value)}
            fullWidth
            multiline
            minRows={14}
            placeholder="Dopo aver eseguito il prompt in ChatGPT, incolla qui la versione rivista del post (e note)."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              disabled={!props.selectedContextId || !props.reviewerResultText.trim() || props.reviewerResultSaving}
              onClick={async () => {
                props.clearError();
                try {
                  await props.saveReviewerResult(props.selectedContextId, props.reviewerResultText.trim());
                } catch (e: unknown) {
                  props.onError(e, "Errore salvataggio revisione");
                }
              }}
            >
              Salva in REVIEWS
            </Button>
            <Button
              variant="outlined"
              disabled={!props.reviewerResultText}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(props.reviewerResultText);
                } catch (e: unknown) {
                  props.onError(e, "Impossibile copiare negli appunti");
                }
              }}
            >
              Copia revisione
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

