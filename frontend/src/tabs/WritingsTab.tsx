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
import type { SocialWritingListItem } from "../api";

export type WritingsTabProps = Readonly<{
  writingsLoading: boolean;
  writings: SocialWritingListItem[];
  selectedContextId: string;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshWritings: () => Promise<void>;
}>;

export function WritingsTab(props: WritingsTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Writings
            </Typography>
            <Button
              variant="outlined"
              disabled={props.writingsLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshWritings();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Writings");
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
                Qui trovi la lista dei <b>writings</b> (output del prompt writer) salvati. Selezionane uno per copiarlo e
                usarlo nei passaggi successivi (varianti/revisione).
              </Typography>
            </Stack>
          </Alert>

          {props.writingsLoading ? <LinearProgress /> : null}

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.writings.find((w) => w.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Writing per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.writing);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField label="Writing" value={selected.writing} fullWidth multiline minRows={14} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {props.selectedContextId && !props.writings.find((w) => w.id === props.selectedContextId) ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessun post salvato per questo contesto.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

