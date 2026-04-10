const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AUTH_TOKEN_STORAGE_KEY = "authToken";

function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // ignore (e.g. disabled storage)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers ? (init.headers as Record<string, string>) : {}),
  };
  if (init?.body != null && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getStoredAuthToken();
  const shouldAttachAuthHeader =
    !path.startsWith("/auth/login") && !path.startsWith("/auth/logout");
  if (shouldAttachAuthHeader && token && !("Authorization" in headers)) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as unknown;
      if (typeof data === "object" && data && "error" in data) {
        const err = (data as { error?: unknown }).error;
        msg = typeof err === "string" ? err : msg;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

export type Me = { userId: string; username: string };

export async function getMe(): Promise<Me> {
  return request<Me>("/auth/me");
}

export async function login(username: string, password: string): Promise<{ ok: true }> {
  const res = await request<{ ok: true; token?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setStoredAuthToken(res.token ?? null);
  return { ok: true };
}

export async function logout(): Promise<{ ok: true }> {
  const res = await request<{ ok: true }>("/auth/logout", { method: "POST" });
  setStoredAuthToken(null);
  return res;
}

export type StyleConfig = {
  tone: "professionale" | "narrativo" | "neutro";
  targetLength: "breve" | "medio" | "lungo";
  emojis: boolean;
  storytellingInstructions: string;
  hashtags: boolean;
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

export type CreateSocialRequestInput = {
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
  needHooks?: boolean;
  needVariants?: boolean;
  brandVoiceNotes?: string;
  examplesOfPastPosts?: string;
};

export async function createSocialRequest(input: CreateSocialRequestInput): Promise<{
  id: string;
  requestId: number;
  createdAt: string;
}> {
  return request(`/social/requests`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type SocialRequestStatus =
  | "nuovo"
  | "da ricercare"
  | "ricerca completata"
  | "da sintetizzare"
  | "bozza pronta"
  | "da revisionare"
  | "finito"
  | "scartato";

export type SocialRequestListItem = {
  id: string;
  requestId: number;
  createdAt: string;
  updatedAt: string;
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
  needHooks?: boolean;
  needVariants?: boolean;
  brandVoiceNotes?: string;
  examplesOfPastPosts?: string;
  status: SocialRequestStatus;
};

export async function listSocialRequests(): Promise<SocialRequestListItem[]> {
  return request<SocialRequestListItem[]>(`/social/requests`);
}

export type SocialPromptListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  researchPrompt: string;
};

export async function listSocialPrompts(): Promise<SocialPromptListItem[]> {
  return request<SocialPromptListItem[]>(`/social/prompts`);
}

export type SocialDistillateListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  distillate: string;
};

export async function listSocialDistillates(): Promise<SocialDistillateListItem[]> {
  return request<SocialDistillateListItem[]>(`/social/distillates`);
}

export type SocialWritingListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  writing: string;
};

export async function listSocialWritings(): Promise<SocialWritingListItem[]> {
  return request<SocialWritingListItem[]>(`/social/writings`);
}

export type SocialVariantsListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  variants: string;
};

export async function listSocialVariants(): Promise<SocialVariantsListItem[]> {
  return request<SocialVariantsListItem[]>(`/social/variants`);
}

export type SocialReviewListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  review: string;
};

export async function listSocialReviews(): Promise<SocialReviewListItem[]> {
  return request<SocialReviewListItem[]>(`/social/reviews`);
}

export type SocialDeepSearchListItem = {
  id: string;
  requestId: number;
  topic: string;
  platform: SocialRequestPlatform;
  createdAt: string;
  updatedAt: string;
  deepSearchReport: string;
};

export async function listSocialDeepSearches(): Promise<SocialDeepSearchListItem[]> {
  return request<SocialDeepSearchListItem[]>(`/social/deep-searches`);
}

export async function saveSocialDistillate(
  requestMongoId: string,
  distillate: string,
): Promise<{ id: string; requestId: number; distillate: string; updatedAt: string }> {
  return request(`/social/requests/${requestMongoId}/distillate`, {
    method: "POST",
    body: JSON.stringify({ distillate }),
  });
}

export async function saveSocialWriting(
  requestMongoId: string,
  writing: string,
): Promise<{ id: string; requestId: number; writing: string; updatedAt: string }> {
  return request(`/social/requests/${requestMongoId}/writing`, {
    method: "POST",
    body: JSON.stringify({ writing }),
  });
}

export async function saveSocialVariants(
  requestMongoId: string,
  variants: string,
): Promise<{ id: string; requestId: number; variants: string; updatedAt: string }> {
  return request(`/social/requests/${requestMongoId}/variants`, {
    method: "POST",
    body: JSON.stringify({ variants }),
  });
}

export async function saveSocialReview(
  requestMongoId: string,
  review: string,
): Promise<{ id: string; requestId: number; review: string; updatedAt: string }> {
  return request(`/social/requests/${requestMongoId}/review`, {
    method: "POST",
    body: JSON.stringify({ review }),
  });
}

export async function saveSocialDeepSearchResult(
  requestMongoId: string,
  deepSearchReport: string,
): Promise<{ id: string; requestId: number; deepSearchReport: string; updatedAt: string }> {
  return request(`/social/requests/${requestMongoId}/deep-search-result`, {
    method: "POST",
    body: JSON.stringify({ deepSearchReport }),
  });
}

export async function generateDeepResearchPrompt(
  requestMongoId: string,
  options?: {
    includeScientificStrongVersion?: boolean;
    includeBusinessStrongVersion?: boolean;
  },
): Promise<{
  id: string;
  requestId: number;
  prompt: string;
  updatedAt: string;
}> {
  return request(`/social/requests/${requestMongoId}/deep-research-prompt`, {
    method: "POST",
    body: JSON.stringify({
      includeScientificStrongVersion: options?.includeScientificStrongVersion === true,
      includeBusinessStrongVersion: options?.includeBusinessStrongVersion === true,
    }),
  });
}

export async function generateDistillationPrompt(
  requestMongoId: string,
  deepResearchReport: string,
): Promise<{
  id: string;
  requestId: number;
  prompt: string;
  updatedAt: string;
}> {
  return request(`/social/requests/${requestMongoId}/distillation-prompt`, {
    method: "POST",
    body: JSON.stringify({ deepResearchReport }),
  });
}

export async function generateWriterPrompt(
  requestMongoId: string,
  baseMaterial: string,
): Promise<{
  id: string;
  requestId: number;
  prompt: string;
  updatedAt: string;
}> {
  return request(`/social/requests/${requestMongoId}/writer-prompt`, {
    method: "POST",
    body: JSON.stringify({ baseMaterial }),
  });
}

export async function generateVariantsPrompt(
  requestMongoId: string,
  draftPostV1: string,
): Promise<{
  id: string;
  requestId: number;
  prompt: string;
  updatedAt: string;
}> {
  return request(`/social/requests/${requestMongoId}/variants-prompt`, {
    method: "POST",
    body: JSON.stringify({ draftPostV1 }),
  });
}

export async function generateReviewerPrompt(
  requestMongoId: string,
  baseInfo: string,
  draftPostV1: string,
): Promise<{
  id: string;
  requestId: number;
  prompt: string;
  updatedAt: string;
}> {
  return request(`/social/requests/${requestMongoId}/reviewer-prompt`, {
    method: "POST",
    body: JSON.stringify({ baseInfo, draftPostV1 }),
  });
}

