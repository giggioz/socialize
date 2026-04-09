import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  LinearProgress,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  createSocialRequest,
  generateDeepResearchPrompt,
  generateDistillationPrompt,
  generateWriterPrompt,
  generateVariantsPrompt,
  generateReviewerPrompt,
  getMe,
  listSocialDistillates,
  listSocialPrompts,
  listSocialRequests,
  listSocialWritings,
  listSocialVariants,
  listSocialReviews,
  listSocialDeepSearches,
  saveSocialDistillate,
  saveSocialWriting,
  saveSocialVariants,
  saveSocialReview,
  saveSocialDeepSearchResult,
  login,
  logout,
  type Me,
  type SocialRequestCtaType,
  type SocialRequestGoal,
  type SocialRequestLengthTarget,
  type SocialRequestListItem,
  type SocialRequestPlatform,
  type SocialRequestTone,
  type SocialDistillateListItem,
  type SocialPromptListItem,
  type SocialWritingListItem,
  type SocialVariantsListItem,
  type SocialReviewListItem,
  type SocialDeepSearchListItem,
} from "./api";
import { CreateTab } from "./tabs/CreateTab";
import { RequestsListTab } from "./tabs/RequestsListTab";
import { PromptsTab } from "./tabs/PromptsTab";
import { DeepSearchesTab } from "./tabs/DeepSearchesTab";
import { DistillationTab } from "./tabs/DistillationTab";
import { DistillatesTab } from "./tabs/DistillatesTab";
import { WriterTab } from "./tabs/WriterTab";
import { WritingsTab } from "./tabs/WritingsTab";
import { VariantsTab } from "./tabs/VariantsTab";
import { VariantsSavedTab } from "./tabs/VariantsSavedTab";
import { ReviewerTab } from "./tabs/ReviewerTab";
import { ReviewsTab } from "./tabs/ReviewsTab";

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && typeof e.message === "string" && e.message) return e.message;
  if (typeof e === "object" && e && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

function LoginCard(props: Readonly<{ onLoggedIn: () => void }>) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Login</Typography>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              type="password"
            />
            <Button
              variant="contained"
              disabled={loading || !username || !password}
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  await login(username, password);
                  props.onLoggedIn();
                } catch (e: unknown) {
                  setError(getErrorMessage(e, "Login failed"));
                } finally {
                  setLoading(false);
                }
              }}
            >
              Entra
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);
  const onError = useCallback((e: unknown, fallback: string) => setError(getErrorMessage(e, fallback)), []);

  const [srTopic, setSrTopic] = useState("");
  const [srMainQuestion, setSrMainQuestion] = useState("");
  const [srGoalOfPost, setSrGoalOfPost] = useState<SocialRequestGoal>("educare");
  const [srPlatform, setSrPlatform] = useState<SocialRequestPlatform>("LinkedIn");
  const [srAudience, setSrAudience] = useState("");
  const [srDesiredTone, setSrDesiredTone] = useState<SocialRequestTone>("professionale");
  const [srLengthTarget, setSrLengthTarget] = useState<SocialRequestLengthTarget>("medio");
  const [srCtaType, setSrCtaType] = useState<SocialRequestCtaType>("nessuna");
  const [srAngleThesis, setSrAngleThesis] = useState("");
  const [srWhatToAvoid, setSrWhatToAvoid] = useState("");
  const [srAllowedSources, setSrAllowedSources] = useState("");
  const [srDisallowedSources, setSrDisallowedSources] = useState("");
  const [srNeedHooks, setSrNeedHooks] = useState(false);
  const [srNeedVariants, setSrNeedVariants] = useState(false);
  const [srBrandVoiceNotes, setSrBrandVoiceNotes] = useState("");
  const [srExamplesOfPastPosts, setSrExamplesOfPastPosts] = useState("");
  const [srCreated, setSrCreated] = useState<{ requestId: number; id: string } | null>(null);

  const [srListLoading, setSrListLoading] = useState(false);
  const [srList, setSrList] = useState<SocialRequestListItem[]>([]);
  const [srSelectedId, setSrSelectedId] = useState<string>("");

  const [drPromptLoading, setDrPromptLoading] = useState(false);
  const [drPromptText, setDrPromptText] = useState("");
  const [drIncludeScientificStrongVersion, setDrIncludeScientificStrongVersion] = useState(false);
  const [drIncludeBusinessStrongVersion, setDrIncludeBusinessStrongVersion] = useState(false);

  const [promptsLoading, setPromptsLoading] = useState(false);
  const [prompts, setPrompts] = useState<SocialPromptListItem[]>([]);
  const [deepSearchResultText, setDeepSearchResultText] = useState("");
  const [deepSearchResultSaving, setDeepSearchResultSaving] = useState(false);

  const [deepSearchesLoading, setDeepSearchesLoading] = useState(false);
  const [deepSearches, setDeepSearches] = useState<SocialDeepSearchListItem[]>([]);

  const [distillatesLoading, setDistillatesLoading] = useState(false);
  const [distillates, setDistillates] = useState<SocialDistillateListItem[]>([]);
  const [selectedDistillateId, setSelectedDistillateId] = useState<string>("");

  const [deepResearchReport, setDeepResearchReport] = useState("");
  const [distillPromptLoading, setDistillPromptLoading] = useState(false);
  const [distillPromptText, setDistillPromptText] = useState("");
  const [distillateText, setDistillateText] = useState("");
  const [distillateSaving, setDistillateSaving] = useState(false);

  const [writerBaseMaterial, setWriterBaseMaterial] = useState("");
  const [writerPromptLoading, setWriterPromptLoading] = useState(false);
  const [writerPromptText, setWriterPromptText] = useState("");
  const [writerResultText, setWriterResultText] = useState("");
  const [writerResultSaving, setWriterResultSaving] = useState(false);

  const [writingsLoading, setWritingsLoading] = useState(false);
  const [writings, setWritings] = useState<SocialWritingListItem[]>([]);

  const [draftPostV1, setDraftPostV1] = useState("");
  const [variantsPromptLoading, setVariantsPromptLoading] = useState(false);
  const [variantsPromptText, setVariantsPromptText] = useState("");
  const [variantsResultText, setVariantsResultText] = useState("");
  const [variantsResultSaving, setVariantsResultSaving] = useState(false);

  const [savedVariantsLoading, setSavedVariantsLoading] = useState(false);
  const [savedVariants, setSavedVariants] = useState<SocialVariantsListItem[]>([]);

  const [reviewerBaseInfo, setReviewerBaseInfo] = useState("");
  const [reviewerDraftPostV1, setReviewerDraftPostV1] = useState("");
  const [reviewerPromptLoading, setReviewerPromptLoading] = useState(false);
  const [reviewerPromptText, setReviewerPromptText] = useState("");
  const [reviewerResultText, setReviewerResultText] = useState("");
  const [reviewerResultSaving, setReviewerResultSaving] = useState(false);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<SocialReviewListItem[]>([]);

  async function refreshMe() {
    const m = await getMe();
    setMe(m);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        setMe(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const refreshSocialRequests = useCallback(async () => {
    setSrListLoading(true);
    try {
      const items = await listSocialRequests();
      setSrList(items);
      if (!srSelectedId && items[0]?.id) setSrSelectedId(items[0].id);
    } finally {
      setSrListLoading(false);
    }
  }, [srSelectedId]);

  const refreshPrompts = useCallback(async () => {
    setPromptsLoading(true);
    try {
      const items = await listSocialPrompts();
      setPrompts(items);
    } finally {
      setPromptsLoading(false);
    }
  }, []);

  const refreshDeepSearches = useCallback(async () => {
    setDeepSearchesLoading(true);
    try {
      const items = await listSocialDeepSearches();
      setDeepSearches(items);
    } finally {
      setDeepSearchesLoading(false);
    }
  }, []);

  const refreshDistillates = useCallback(async () => {
    setDistillatesLoading(true);
    try {
      const items = await listSocialDistillates();
      setDistillates(items);
      if (!selectedDistillateId && items[0]?.id) setSelectedDistillateId(items[0].id);
    } finally {
      setDistillatesLoading(false);
    }
  }, [selectedDistillateId]);

  const refreshWritings = useCallback(async () => {
    setWritingsLoading(true);
    try {
      const items = await listSocialWritings();
      setWritings(items);
    } finally {
      setWritingsLoading(false);
    }
  }, []);

  const refreshVariants = useCallback(async () => {
    setSavedVariantsLoading(true);
    try {
      const items = await listSocialVariants();
      setSavedVariants(items);
    } finally {
      setSavedVariantsLoading(false);
    }
  }, []);

  const refreshReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const items = await listSocialReviews();
      setReviews(items);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    refreshSocialRequests().catch(() => {});
  }, [me?.userId, me, refreshSocialRequests]);

  useEffect(() => {
    if (!srSelectedId) return;
    const deepSearch = deepSearches.find((d) => d.id === srSelectedId);
    if (deepSearch?.deepSearchReport) setDeepResearchReport(deepSearch.deepSearchReport);

    const distill = distillates.find((d) => d.id === srSelectedId);
    if (distill?.distillate) setWriterBaseMaterial(distill.distillate);
    if (distill?.distillate) setReviewerBaseInfo(distill.distillate);

    const writing = writings.find((w) => w.id === srSelectedId);
    if (writing?.writing) setDraftPostV1(writing.writing);
    if (writing?.writing) setReviewerDraftPostV1(writing.writing);
  }, [srSelectedId, deepSearches, distillates, writings]);

  useEffect(() => {
    if (!me) return;
    refreshPrompts().catch(() => {});
  }, [me?.userId, me, refreshPrompts]);

  useEffect(() => {
    if (!me) return;
    refreshDeepSearches().catch(() => {});
  }, [me?.userId, me, refreshDeepSearches]);

  useEffect(() => {
    if (!me) return;
    refreshDistillates().catch(() => {});
  }, [me?.userId, me, refreshDistillates]);

  useEffect(() => {
    if (!me) return;
    refreshWritings().catch(() => {});
  }, [me?.userId, me, refreshWritings]);

  useEffect(() => {
    if (!me) return;
    refreshVariants().catch(() => {});
  }, [me?.userId, me, refreshVariants]);

  useEffect(() => {
    if (!me) return;
    refreshReviews().catch(() => {});
  }, [me?.userId, me, refreshReviews]);

  if (booting) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!me) {
    return (
      <LoginCard
        onLoggedIn={async () => {
          await refreshMe();
        }}
      />
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Socialize
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            {me.username}
          </Typography>
          <Button
            color="inherit"
            onClick={async () => {
              await logout();
              setMe(null);
            }}
          >
            Esci
          </Button>
        </Toolbar>
      </AppBar>

      {loading ? <LinearProgress /> : null}

      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1">Contesto selezionato</Typography>

                {srListLoading ? <LinearProgress /> : null}

                {srList.length ? (
                  <FormControl sx={{ minWidth: 360 }}>
                    <InputLabel id="global-context-select-label">Seleziona contesto</InputLabel>
                    <Select
                      labelId="global-context-select-label"
                      label="Seleziona contesto"
                      value={srSelectedId}
                      onChange={(e) => setSrSelectedId(String(e.target.value))}
                    >
                      {srList.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          #{r.requestId} · {r.topic} · {r.platform}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Nessun contesto ancora.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="CREA CONTESTO" />
            <Tab label="CONTESTI" />
            <Tab label="CREA PROMPT DEEP SEARCH" />
            <Tab label="DEEP SEARCHES" />
            <Tab label="CREA DISTILLATO" />
            <Tab label="DISTILLATI" />
            <Tab label="CREA POST" />
            <Tab label="POSTS" />
            <Tab label="CREA VARIANTI" />
            <Tab label="VARIANTS" />
            <Tab label="CREA REVISIONE" />
            <Tab label="REVISIONI" />
          </Tabs>

          {tab === 0 ? (
            <CreateTab
              loading={loading}
              setLoading={setLoading}
              clearError={clearError}
              onError={onError}
              srTopic={srTopic}
              setSrTopic={setSrTopic}
              srMainQuestion={srMainQuestion}
              setSrMainQuestion={setSrMainQuestion}
              srGoalOfPost={srGoalOfPost}
              setSrGoalOfPost={setSrGoalOfPost}
              srPlatform={srPlatform}
              setSrPlatform={setSrPlatform}
              srAudience={srAudience}
              setSrAudience={setSrAudience}
              srDesiredTone={srDesiredTone}
              setSrDesiredTone={setSrDesiredTone}
              srLengthTarget={srLengthTarget}
              setSrLengthTarget={setSrLengthTarget}
              srCtaType={srCtaType}
              setSrCtaType={setSrCtaType}
              srAngleThesis={srAngleThesis}
              setSrAngleThesis={setSrAngleThesis}
              srWhatToAvoid={srWhatToAvoid}
              setSrWhatToAvoid={setSrWhatToAvoid}
              srAllowedSources={srAllowedSources}
              setSrAllowedSources={setSrAllowedSources}
              srDisallowedSources={srDisallowedSources}
              setSrDisallowedSources={setSrDisallowedSources}
              srNeedHooks={srNeedHooks}
              setSrNeedHooks={setSrNeedHooks}
              srNeedVariants={srNeedVariants}
              setSrNeedVariants={setSrNeedVariants}
              srBrandVoiceNotes={srBrandVoiceNotes}
              setSrBrandVoiceNotes={setSrBrandVoiceNotes}
              srExamplesOfPastPosts={srExamplesOfPastPosts}
              setSrExamplesOfPastPosts={setSrExamplesOfPastPosts}
              srCreated={srCreated}
              setSrCreated={setSrCreated}
              createSocialRequest={createSocialRequest}
            />
          ) : null}

          {tab === 1 ? (
            <RequestsListTab
              srListLoading={srListLoading}
              srList={srList}
              selectedContextId={srSelectedId}
              drPromptLoading={drPromptLoading}
              drPromptText={drPromptText}
              setDrPromptText={setDrPromptText}
              drIncludeScientificStrongVersion={drIncludeScientificStrongVersion}
              setDrIncludeScientificStrongVersion={setDrIncludeScientificStrongVersion}
              drIncludeBusinessStrongVersion={drIncludeBusinessStrongVersion}
              setDrIncludeBusinessStrongVersion={setDrIncludeBusinessStrongVersion}
              setDrPromptLoading={setDrPromptLoading}
              clearError={clearError}
              onError={onError}
              refreshSocialRequests={refreshSocialRequests}
              refreshPrompts={refreshPrompts}
              generateDeepResearchPrompt={generateDeepResearchPrompt}
            />
          ) : null}

          {tab === 2 ? (
            <PromptsTab
              promptsLoading={promptsLoading}
              prompts={prompts}
              selectedContextId={srSelectedId}
              deepSearchResultText={deepSearchResultText}
              setDeepSearchResultText={setDeepSearchResultText}
              deepSearchResultSaving={deepSearchResultSaving}
              saveDeepSearchResult={async (requestMongoId, report) => {
                setDeepSearchResultSaving(true);
                try {
                  await saveSocialDeepSearchResult(requestMongoId, report);
                  await refreshDeepSearches();
                } finally {
                  setDeepSearchResultSaving(false);
                }
              }}
              clearError={clearError}
              onError={onError}
              refreshPrompts={refreshPrompts}
            />
          ) : null}

          {tab === 3 ? (
            <DeepSearchesTab
              deepSearchesLoading={deepSearchesLoading}
              deepSearches={deepSearches}
              selectedContextId={srSelectedId}
              clearError={clearError}
              onError={onError}
              refreshDeepSearches={refreshDeepSearches}
            />
          ) : null}

          {tab === 4 ? (
            <DistillationTab
              selectedContextId={srSelectedId}
              deepResearchReport={deepResearchReport}
              setDeepResearchReport={setDeepResearchReport}
              distillPromptLoading={distillPromptLoading}
              distillPromptText={distillPromptText}
              setDistillPromptText={setDistillPromptText}
              setDistillPromptLoading={setDistillPromptLoading}
              distillateText={distillateText}
              setDistillateText={setDistillateText}
              distillateSaving={distillateSaving}
              clearError={clearError}
              onError={onError}
              generateDistillationPrompt={generateDistillationPrompt}
              saveDistillate={async (requestId, text) => {
                setDistillateSaving(true);
                try {
                  await saveSocialDistillate(requestId, text);
                  await refreshDistillates();
                } finally {
                  setDistillateSaving(false);
                }
              }}
            />
          ) : null}

          {tab === 5 ? (
            <DistillatesTab
              distillatesLoading={distillatesLoading}
              distillates={distillates}
              selectedContextId={srSelectedId}
              clearError={clearError}
              onError={onError}
              refreshDistillates={refreshDistillates}
            />
          ) : null}

          {tab === 6 ? (
            <WriterTab
              selectedContextId={srSelectedId}
              writerBaseMaterial={writerBaseMaterial}
              setWriterBaseMaterial={setWriterBaseMaterial}
              writerResultText={writerResultText}
              setWriterResultText={setWriterResultText}
              writerResultSaving={writerResultSaving}
              saveWriterResult={async (requestId, writing) => {
                setWriterResultSaving(true);
                try {
                  await saveSocialWriting(requestId, writing);
                  await refreshWritings();
                } finally {
                  setWriterResultSaving(false);
                }
              }}
              writerPromptLoading={writerPromptLoading}
              writerPromptText={writerPromptText}
              setWriterPromptText={setWriterPromptText}
              setWriterPromptLoading={setWriterPromptLoading}
              clearError={clearError}
              onError={onError}
              generateWriterPrompt={generateWriterPrompt}
            />
          ) : null}

          {tab === 7 ? (
            <WritingsTab
              writingsLoading={writingsLoading}
              writings={writings}
              selectedContextId={srSelectedId}
              clearError={clearError}
              onError={onError}
              refreshWritings={refreshWritings}
            />
          ) : null}

          {tab === 8 ? (
            <VariantsTab
              selectedContextId={srSelectedId}
              draftPostV1={draftPostV1}
              setDraftPostV1={setDraftPostV1}
              variantsResultText={variantsResultText}
              setVariantsResultText={setVariantsResultText}
              variantsResultSaving={variantsResultSaving}
              saveVariantsResult={async (requestId, variants) => {
                setVariantsResultSaving(true);
                try {
                  await saveSocialVariants(requestId, variants);
                  await refreshVariants();
                } finally {
                  setVariantsResultSaving(false);
                }
              }}
              variantsPromptLoading={variantsPromptLoading}
              variantsPromptText={variantsPromptText}
              setVariantsPromptText={setVariantsPromptText}
              setVariantsPromptLoading={setVariantsPromptLoading}
              clearError={clearError}
              onError={onError}
              generateVariantsPrompt={generateVariantsPrompt}
            />
          ) : null}

          {tab === 9 ? (
            <VariantsSavedTab
              variantsLoading={savedVariantsLoading}
              variants={savedVariants}
              selectedContextId={srSelectedId}
              clearError={clearError}
              onError={onError}
              refreshVariants={refreshVariants}
            />
          ) : null}

          {tab === 10 ? (
            <ReviewerTab
              selectedContextId={srSelectedId}
              reviewerBaseInfo={reviewerBaseInfo}
              setReviewerBaseInfo={setReviewerBaseInfo}
              reviewerDraftPostV1={reviewerDraftPostV1}
              setReviewerDraftPostV1={setReviewerDraftPostV1}
              reviewerResultText={reviewerResultText}
              setReviewerResultText={setReviewerResultText}
              reviewerResultSaving={reviewerResultSaving}
              saveReviewerResult={async (requestId, review) => {
                setReviewerResultSaving(true);
                try {
                  await saveSocialReview(requestId, review);
                  await refreshReviews();
                } finally {
                  setReviewerResultSaving(false);
                }
              }}
              reviewerPromptLoading={reviewerPromptLoading}
              reviewerPromptText={reviewerPromptText}
              setReviewerPromptText={setReviewerPromptText}
              setReviewerPromptLoading={setReviewerPromptLoading}
              clearError={clearError}
              onError={onError}
              generateReviewerPrompt={generateReviewerPrompt}
            />
          ) : null}

          {tab === 11 ? (
            <ReviewsTab
              reviewsLoading={reviewsLoading}
              reviews={reviews}
              selectedContextId={srSelectedId}
              clearError={clearError}
              onError={onError}
              refreshReviews={refreshReviews}
            />
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
