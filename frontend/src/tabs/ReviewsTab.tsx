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
import type { SocialReviewListItem } from "../api";

export type ReviewsTabProps = Readonly<{
  reviewsLoading: boolean;
  reviews: SocialReviewListItem[];
  selectedContextId: string;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshReviews: () => Promise<void>;
}>;

export function ReviewsTab(props: ReviewsTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Reviews
            </Typography>
            <Button
              variant="outlined"
              disabled={props.reviewsLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshReviews();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Reviews");
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
                Qui trovi le <b>revisioni</b> salvate (output del prompt revisore). Selezionane una per copiarla e usarla come
                versione pronta.
              </Typography>
            </Stack>
          </Alert>

          {props.reviewsLoading ? <LinearProgress /> : null}

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.reviews.find((r) => r.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Revisione per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.review);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField label="Revisione" value={selected.review} fullWidth multiline minRows={14} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {props.selectedContextId && !props.reviews.find((r) => r.id === props.selectedContextId) ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessuna revisione salvata per questo contesto.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

