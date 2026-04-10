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
import type { SocialVariantsListItem } from "../api";
import { copyTextToClipboard } from "../clipboard";

export type VariantsSavedTabProps = Readonly<{
  variantsLoading: boolean;
  variants: SocialVariantsListItem[];
  selectedContextId: string;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;
  refreshVariants: () => Promise<void>;
}>;

export function VariantsSavedTab(props: VariantsSavedTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Variants
            </Typography>
            <Button
              variant="outlined"
              disabled={props.variantsLoading}
              onClick={async () => {
                props.clearError();
                try {
                  await props.refreshVariants();
                } catch (e: unknown) {
                  props.onError(e, "Errore caricamento Variants");
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
                Qui trovi i <b>risultati delle varianti</b> salvati (output di ChatGPT). Selezionane uno per copiarlo e
                riutilizzarlo.
              </Typography>
            </Stack>
          </Alert>

          {props.variantsLoading ? <LinearProgress /> : null}

          {!props.selectedContextId ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Seleziona prima un contesto.
            </Typography>
          ) : null}

          {(() => {
            const selected = props.variants.find((v) => v.id === props.selectedContextId);
            if (!selected) return null;
            return (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Varianti per Request #{selected.requestId}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await copyTextToClipboard(selected.variants);
                          } catch (e: unknown) {
                            props.onError(e, "Impossibile copiare negli appunti");
                          }
                        }}
                      >
                        Copia
                      </Button>
                    </Stack>
                    <TextField label="Varianti" value={selected.variants} fullWidth multiline minRows={14} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {props.selectedContextId && !props.variants.find((v) => v.id === props.selectedContextId) ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Nessuna variante salvata per questo contesto.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

