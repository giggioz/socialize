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
import type { SocialDistillateListItem } from "../api";
import { copyTextToClipboard } from "../clipboard";

export type DistillatesTabProps = Readonly<{
  distillatesLoading: boolean;
  distillates: SocialDistillateListItem[];
  selectedContextId: string;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshDistillates: () => Promise<void>;
}>;

export function DistillatesTab(props: DistillatesTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Distillati salvati
            </Typography>
            <Button
              variant="outlined"
              disabled={props.distillatesLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshDistillates();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Distillati");
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
                Qui trovi la lista dei <b>distillati</b> (schede sintetiche) salvati. Selezionane uno, copialo e incollalo
                come materiale di base nel tab <b>Scrittura</b>.
              </Typography>
            </Stack>
          </Alert>

          {props.distillatesLoading ? <LinearProgress /> : null}

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.distillates.find((d) => d.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Distillato per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await copyTextToClipboard(selected.distillate);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField label="Distillato" value={selected.distillate} fullWidth multiline minRows={12} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {props.selectedContextId && !props.distillates.find((d) => d.id === props.selectedContextId) ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessun distillato salvato per questo contesto.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

