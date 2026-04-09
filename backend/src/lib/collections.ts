import type { Collection, Db, WithId } from "mongodb";

export type UserDoc = {
  username: string;
  passwordHash: string;
  createdAt: Date;
};

export type SocialRequestGoal =
  | "educare"
  | "convincere"
  | "generare engagement"
  | "autorevolezza"
  | "lead"
  | "commenti"
  | "traffico";

export type SocialRequestPlatform = "LinkedIn" | "Instagram" | "Facebook" | "X";

export type SocialRequestTone =
  | "professionale"
  | "divulgativo"
  | "caldo"
  | "diretto"
  | "autorevole"
  | "provocatorio"
  | "essenziale";

export type SocialRequestLengthTarget = "corto" | "medio" | "lungo";

export type SocialRequestCtaType =
  | "nessuna"
  | "commento"
  | "DM"
  | "follow"
  | "click"
  | "salvataggio"
  | "condivisione";

export type SocialRequestStatus =
  | "nuovo"
  | "da ricercare"
  | "ricerca completata"
  | "da sintetizzare"
  | "bozza pronta"
  | "da revisionare"
  | "finito"
  | "scartato";

export type SocialRequestDoc = {
  userId: string;
  requestId: number;
  createdAt: Date;
  updatedAt: Date;

  topic: string;
  mainQuestion: string;
  goalOfPost: SocialRequestGoal;
  platform: SocialRequestPlatform;
  audience: string;
  desiredTone: SocialRequestTone;
  lengthTarget?: SocialRequestLengthTarget;
  ctaType?: SocialRequestCtaType;
  angleThesis?: string;
  whatToAvoid?: string;
  allowedSources?: string;
  disallowedSources?: string;
  needCitationsInFinalPost?: boolean;
  needHooks?: boolean;
  needVariants?: boolean;
  brandVoiceNotes?: string;
  examplesOfPastPosts?: string;

  status: SocialRequestStatus;

  researchPrompt?: string;
  deepResearchReport?: string;
  distillationPrompt?: string;
  researchStructuredJson?: string;
  distillateText?: string;
  writerBaseMaterial?: string;
  writerPrompt?: string;
  writingText?: string;
  draftPostV1?: string;
  variantsPrompt?: string;
  variantsText?: string;
  reviewerPrompt?: string;
  draftPostRevised?: string;
  hooks?: string;
  ctas?: string;
  finalApproved?: string;
  notes?: string;
};

export type PromptBlockType = "system" | "research" | "distillation" | "writer" | "reviewer" | "style";

export type PromptBlockDoc = {
  userId: string;
  blockName: string;
  blockType: PromptBlockType;
  text: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StyleProfileDoc = {
  userId: string;
  profileName: string;
  platform?: SocialRequestPlatform;
  tone?: SocialRequestTone;
  openingStyle?: string;
  formattingRules?: string;
  forbiddenExpressions?: string;
  ctaStyle?: string;
  examplePost?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SourceRuleDoc = {
  userId: string;
  ruleName: string;
  topicFamily?: string;
  preferredSourceTypes?: string;
  excludedSourceTypes?: string;
  freshnessRule?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CounterDoc = {
  _id: string;
  seq: number;
};

export type ResearchStatus = "completed" | "failed";

export type ResearchDoc = {
  userId: string;
  subject: string;
  status: ResearchStatus;
  options: {
    maxResults: number;
    language?: string;
  };
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SourceFetchStatus = "ok" | "skipped" | "error";

export type SourceDoc = {
  researchId: string;
  url: string;
  title?: string;
  snippet?: string;
  extractedText?: string;
  relevanceScore?: number;
  llmSummary?: string;
  includeInPost?: boolean;
  fetchStatus: SourceFetchStatus;
  createdAt: Date;
};

export type Platform = "facebook" | "instagram";

export type StyleConfig = {
  tone: "professionale" | "narrativo" | "neutro";
  targetLength: "breve" | "medio" | "lungo";
  emojis: boolean;
  storytellingInstructions: string;
  hashtags: boolean;
};

export type PostDraftDoc = {
  researchId: string;
  userId: string;
  platform: Platform;
  styleConfig: StyleConfig;
  body: string;
  charCount: number;
  createdAt: Date;
};

export function collections(db: Db): {
  users: Collection<UserDoc>;
  researches: Collection<ResearchDoc>;
  sources: Collection<SourceDoc>;
  postDrafts: Collection<PostDraftDoc>;
  socialRequests: Collection<SocialRequestDoc>;
  promptBlocks: Collection<PromptBlockDoc>;
  styleProfiles: Collection<StyleProfileDoc>;
  sourceRules: Collection<SourceRuleDoc>;
  counters: Collection<CounterDoc>;
} {
  return {
    users: db.collection<UserDoc>("users"),
    researches: db.collection<ResearchDoc>("researches"),
    sources: db.collection<SourceDoc>("sources"),
    postDrafts: db.collection<PostDraftDoc>("post_drafts"),
    socialRequests: db.collection<SocialRequestDoc>("social_requests"),
    promptBlocks: db.collection<PromptBlockDoc>("prompt_blocks"),
    styleProfiles: db.collection<StyleProfileDoc>("style_profiles"),
    sourceRules: db.collection<SourceRuleDoc>("source_rules"),
    counters: db.collection<CounterDoc>("counters"),
  };
}

export type UserWithId = WithId<UserDoc>;

