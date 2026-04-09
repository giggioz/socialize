import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type {
  SocialRequestCtaType,
  SocialRequestGoal,
  SocialRequestLengthTarget,
  SocialRequestPlatform,
  SocialRequestTone,
} from "../api";

export type CreateTabProps = Readonly<{
  loading: boolean;
  setLoading: (v: boolean) => void;
  clearError: () => void;
  onError: (e: unknown, fallback: string) => void;

  srTopic: string;
  setSrTopic: (v: string) => void;
  srMainQuestion: string;
  setSrMainQuestion: (v: string) => void;
  srGoalOfPost: SocialRequestGoal;
  setSrGoalOfPost: (v: SocialRequestGoal) => void;
  srPlatform: SocialRequestPlatform;
  setSrPlatform: (v: SocialRequestPlatform) => void;
  srAudience: string;
  setSrAudience: (v: string) => void;
  srDesiredTone: SocialRequestTone;
  setSrDesiredTone: (v: SocialRequestTone) => void;
  srLengthTarget: SocialRequestLengthTarget;
  setSrLengthTarget: (v: SocialRequestLengthTarget) => void;
  srCtaType: SocialRequestCtaType;
  setSrCtaType: (v: SocialRequestCtaType) => void;
  srAngleThesis: string;
  setSrAngleThesis: (v: string) => void;
  srWhatToAvoid: string;
  setSrWhatToAvoid: (v: string) => void;
  srAllowedSources: string;
  setSrAllowedSources: (v: string) => void;
  srDisallowedSources: string;
  setSrDisallowedSources: (v: string) => void;
  srNeedHooks: boolean;
  setSrNeedHooks: (v: boolean) => void;
  srNeedVariants: boolean;
  setSrNeedVariants: (v: boolean) => void;
  srBrandVoiceNotes: string;
  setSrBrandVoiceNotes: (v: string) => void;
  srExamplesOfPastPosts: string;
  setSrExamplesOfPastPosts: (v: string) => void;

  srCreated: { requestId: number; id: string } | null;
  setSrCreated: (v: { requestId: number; id: string } | null) => void;

  createSocialRequest: (payload: {
    topic: string;
    mainQuestion: string;
    goalOfPost: SocialRequestGoal;
    platform: SocialRequestPlatform;
    audience: string;
    desiredTone: SocialRequestTone;
    lengthTarget: SocialRequestLengthTarget;
    ctaType: SocialRequestCtaType;
    angleThesis?: string;
    whatToAvoid?: string;
    allowedSources?: string;
    disallowedSources?: string;
    needHooks: boolean;
    needVariants: boolean;
    brandVoiceNotes?: string;
    examplesOfPastPosts?: string;
  }) => Promise<{ requestId: number; id: string }>;
}>;

export function CreateTab(props: CreateTabProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Crea contesto</Typography>

          <Alert severity="info">
            <Stack spacing={1}>
              <Typography variant="subtitle2">Cos’è questo tab</Typography>
              <Typography variant="body2">
                Qui crei una <b>Request</b>: l’input strutturato che useremo per generare contenuti (es. post) coerenti con
                obiettivo, piattaforma, tono e vincoli.
              </Typography>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Esempio (compilazione)
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>
                      <b>Topic</b>: “Costruisci i tuoi successi: come creare abitudini che durano”
                    </li>
                    <li>
                      <b>Main question</b>: “Qual è un metodo pratico per restare costanti quando la motivazione cala?”
                    </li>
                    <li>
                      <b>Goal of post</b>: “educare”
                    </li>
                    <li>
                      <b>Platform</b>: “LinkedIn”
                    </li>
                    <li>
                      <b>Audience</b>: “Professionisti (25–45) che vogliono migliorare disciplina e produttività”
                    </li>
                    <li>
                      <b>Desired tone</b>: “caldo” (con esempi pratici)
                    </li>
                    <li>
                      <b>Length target</b>: “medio”
                    </li>
                    <li>
                      <b>CTA type</b>: “commento” (chiedi di condividere un’abitudine)
                    </li>
                  </ul>
                </Typography>
              </Box>

              <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    <b>Topic</b>: l’argomento in 1 riga (il “tema” del contenuto).
                  </li>
                  <li>
                    <b>Main question</b>: la domanda guida a cui il post deve rispondere; più è specifica, meglio è.
                  </li>
                  <li>
                    <b>Goal of post</b>: l’obiettivo principale (educare, convincere, lead, ecc.).
                  </li>
                  <li>
                    <b>Platform</b>: dove verrà pubblicato (influenza formato e stile).
                  </li>
                  <li>
                    <b>Audience</b>: a chi parli (ruolo, livello, bisogni, contesto).
                  </li>
                  <li>
                    <b>Desired tone</b>: voce/tono (professionale, caldo, diretto, ecc.).
                  </li>
                  <li>
                    <b>Length target</b>: quanto lungo deve essere (corto/medio/lungo).
                  </li>
                  <li>
                    <b>CTA type</b>: azione finale desiderata (commento, DM, follow, click… o nessuna).
                  </li>
                  <li>
                    <b>Angle / thesis</b>: la tesi/angolo (es. “la costanza batte la motivazione”).
                  </li>
                  <li>
                    <b>What to avoid</b>: cose da non dire/fare (claim, parole, temi, esempi, ecc.).
                  </li>
                  <li>
                    <b>Allowed sources</b>: fonti consentite o da citare (link, autori, libri).
                  </li>
                  <li>
                    <b>Disallowed sources</b>: fonti da evitare (per policy, brand, accuratezza).
                  </li>
                  <li>
                    <b>Need hooks?</b>: se vuoi anche proposte di aperture/incipit.
                  </li>
                  <li>
                    <b>Need variants?</b>: se vuoi più versioni alternative dello stesso contenuto.
                  </li>
                  <li>
                    <b>Brand voice notes</b>: note di stile (parole ricorrenti, cosa preferire/evitare, ritmo, emoji sì/no).
                  </li>
                  <li>
                    <b>Examples of past posts</b>: esempi (tuoi o di riferimento) per imitare struttura e tono.
                  </li>
                </ul>
              </Typography>
            </Stack>
          </Alert>

          {props.srCreated ? (
            <Alert severity="success">
              Creato Request #{props.srCreated.requestId} (id: {props.srCreated.id})
            </Alert>
          ) : null}

          <TextField
            label="Topic *"
            value={props.srTopic}
            onChange={(e) => props.setSrTopic(e.target.value)}
            fullWidth
          />
          <TextField
            label="Main question *"
            value={props.srMainQuestion}
            onChange={(e) => props.setSrMainQuestion(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel id="sr-goal-label">Goal of post *</InputLabel>
              <Select
                labelId="sr-goal-label"
                label="Goal of post *"
                value={props.srGoalOfPost}
                onChange={(e) => props.setSrGoalOfPost(e.target.value as SocialRequestGoal)}
              >
                <MenuItem value="educare">educare</MenuItem>
                <MenuItem value="convincere">convincere</MenuItem>
                <MenuItem value="generare engagement">generare engagement</MenuItem>
                <MenuItem value="autorevolezza">autorevolezza</MenuItem>
                <MenuItem value="lead">lead</MenuItem>
                <MenuItem value="commenti">commenti</MenuItem>
                <MenuItem value="traffico">traffico</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="sr-platform-label">Platform *</InputLabel>
              <Select
                labelId="sr-platform-label"
                label="Platform *"
                value={props.srPlatform}
                onChange={(e) => props.setSrPlatform(e.target.value as SocialRequestPlatform)}
              >
                <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                <MenuItem value="Instagram">Instagram</MenuItem>
                <MenuItem value="Facebook">Facebook</MenuItem>
                <MenuItem value="X">X</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel id="sr-tone-label">Desired tone *</InputLabel>
              <Select
                labelId="sr-tone-label"
                label="Desired tone *"
                value={props.srDesiredTone}
                onChange={(e) => props.setSrDesiredTone(e.target.value as SocialRequestTone)}
              >
                <MenuItem value="professionale">professionale</MenuItem>
                <MenuItem value="divulgativo">divulgativo</MenuItem>
                <MenuItem value="caldo">caldo</MenuItem>
                <MenuItem value="diretto">diretto</MenuItem>
                <MenuItem value="autorevole">autorevole</MenuItem>
                <MenuItem value="provocatorio">provocatorio</MenuItem>
                <MenuItem value="essenziale">essenziale</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Audience *"
            value={props.srAudience}
            onChange={(e) => props.setSrAudience(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="sr-len-label">Length target</InputLabel>
              <Select
                labelId="sr-len-label"
                label="Length target"
                value={props.srLengthTarget}
                onChange={(e) => props.setSrLengthTarget(e.target.value as SocialRequestLengthTarget)}
              >
                <MenuItem value="corto">corto</MenuItem>
                <MenuItem value="medio">medio</MenuItem>
                <MenuItem value="lungo">lungo</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="sr-cta-label">CTA type</InputLabel>
              <Select
                labelId="sr-cta-label"
                label="CTA type"
                value={props.srCtaType}
                onChange={(e) => props.setSrCtaType(e.target.value as SocialRequestCtaType)}
              >
                <MenuItem value="nessuna">nessuna</MenuItem>
                <MenuItem value="commento">commento</MenuItem>
                <MenuItem value="DM">DM</MenuItem>
                <MenuItem value="follow">follow</MenuItem>
                <MenuItem value="click">click</MenuItem>
                <MenuItem value="salvataggio">salvataggio</MenuItem>
                <MenuItem value="condivisione">condivisione</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Angle / thesis"
            value={props.srAngleThesis}
            onChange={(e) => props.setSrAngleThesis(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="What to avoid"
            value={props.srWhatToAvoid}
            onChange={(e) => props.setSrWhatToAvoid(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Allowed sources"
            value={props.srAllowedSources}
            onChange={(e) => props.setSrAllowedSources(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Disallowed sources"
            value={props.srDisallowedSources}
            onChange={(e) => props.setSrDisallowedSources(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControlLabel
              control={<Switch checked={props.srNeedHooks} onChange={(e) => props.setSrNeedHooks(e.target.checked)} />}
              label="Need hooks?"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={props.srNeedVariants}
                  onChange={(e) => props.setSrNeedVariants(e.target.checked)}
                />
              }
              label="Need variants?"
            />
          </Stack>

          <TextField
            label="Brand voice notes"
            value={props.srBrandVoiceNotes}
            onChange={(e) => props.setSrBrandVoiceNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Examples of past posts"
            value={props.srExamplesOfPastPosts}
            onChange={(e) => props.setSrExamplesOfPastPosts(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Box>
            <Button
              variant="contained"
              disabled={
                props.loading ||
                !props.srTopic.trim() ||
                !props.srMainQuestion.trim() ||
                !props.srAudience.trim() ||
                !props.srGoalOfPost ||
                !props.srPlatform ||
                !props.srDesiredTone
              }
              onClick={async () => {
                props.setLoading(true);
                props.clearError();
                props.setSrCreated(null);
                try {
                  const res = await props.createSocialRequest({
                    topic: props.srTopic.trim(),
                    mainQuestion: props.srMainQuestion.trim(),
                    goalOfPost: props.srGoalOfPost,
                    platform: props.srPlatform,
                    audience: props.srAudience.trim(),
                    desiredTone: props.srDesiredTone,
                    lengthTarget: props.srLengthTarget,
                    ctaType: props.srCtaType,
                    angleThesis: props.srAngleThesis.trim() || undefined,
                    whatToAvoid: props.srWhatToAvoid.trim() || undefined,
                    allowedSources: props.srAllowedSources.trim() || undefined,
                    disallowedSources: props.srDisallowedSources.trim() || undefined,
                    needHooks: props.srNeedHooks,
                    needVariants: props.srNeedVariants,
                    brandVoiceNotes: props.srBrandVoiceNotes.trim() || undefined,
                    examplesOfPastPosts: props.srExamplesOfPastPosts.trim() || undefined,
                  });
                  props.setSrCreated({ requestId: res.requestId, id: res.id });
                  props.setSrTopic("");
                  props.setSrMainQuestion("");
                  props.setSrAudience("");
                  props.setSrAngleThesis("");
                  props.setSrWhatToAvoid("");
                  props.setSrAllowedSources("");
                  props.setSrDisallowedSources("");
                  props.setSrNeedHooks(false);
                  props.setSrNeedVariants(false);
                  props.setSrBrandVoiceNotes("");
                  props.setSrExamplesOfPastPosts("");
                } catch (e: unknown) {
                  props.onError(e, "Errore creazione Request");
                } finally {
                  props.setLoading(false);
                }
              }}
            >
              Crea Request
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

