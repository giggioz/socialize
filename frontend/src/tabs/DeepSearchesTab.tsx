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
import type { SocialDeepSearchListItem } from "../api";

export type DeepSearchesTabProps = Readonly<{
  deepSearchesLoading: boolean;
  deepSearches: SocialDeepSearchListItem[];
  selectedContextId: string;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshDeepSearches: () => Promise<void>;
}>;

export function DeepSearchesTab(props: DeepSearchesTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Deep searches
            </Typography>
            <Button
              variant="outlined"
              disabled={props.deepSearchesLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshDeepSearches();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Deep searches");
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
                Qui trovi i <b>report di Deep Search</b> salvati. Selezionane uno per copiarlo e usarlo subito per distillazione.
              </Typography>
            </Stack>
          </Alert>

          {props.deepSearchesLoading ? <LinearProgress /> : null}

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.deepSearches.find((d) => d.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Report per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.deepSearchReport);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField
                      label="Report Deep Search"
                      value={selected.deepSearchReport}
                      fullWidth
                      multiline
                      minRows={14}
                    />
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {props.selectedContextId && !props.deepSearches.find((d) => d.id === props.selectedContextId) ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessuna deep search salvata per questo contesto.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

