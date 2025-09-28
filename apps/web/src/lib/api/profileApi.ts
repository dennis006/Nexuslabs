import { useUserStore } from "@/store/userStore";
import { fetchWithAuth } from "./authApi";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

export type Role = "MEMBER" | "ADMIN";
export type TrustLevel =
  | "NEWCOMER"
  | "MEMBER"
  | "CONTRIBUTOR"
  | "VETERAN"
  | "MODERATOR"
  | "ADMINISTRATOR";

export type ProfileStreak = {
  current: number;
  best: number;
  lastActiveAt: string | null;
};

export type ProfileStats = {
  topics: number;
  posts: number;
  likesGiven: number;
  likesReceived: number;
  reputation: number;
  trustLevel: TrustLevel;
  streak: ProfileStreak;
};

export type ProfileMetadata = {
  joinedAt: string;
  lastOnline: string | null;
  location: string | null;
  timezone: string | null;
  localTime: string | null;
  birthday: string | null;
  email: string | null;
};

export type ProfileSocial = {
  id: string;
  label?: string;
  url: string;
  handle?: string | null;
  icon?: string | null;
};

export type ProfileLink = {
  label: string;
  url: string;
};

export type ProfileContact = {
  website: string | null;
  socials: ProfileSocial[];
  links: ProfileLink[];
  pronouns: string | null;
  canMessage: boolean;
  pmAvailable: boolean;
};

export type ProfileBadge = {
  id: string;
  earnedAt: string;
  seasonKey: string | null;
  note: string | null;
  badge: {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string | null;
    isSeasonal: boolean;
    seasonKey: string | null;
    startsAt: string | null;
    endsAt: string | null;
  };
};

export type CustomBadge = ProfileSocial;

export type ConnectedAccount = {
  id: string;
  provider:
    | "DISCORD"
    | "GITHUB"
    | "STEAM"
    | "TWITTER"
    | "MASTODON"
    | "BLUESKY"
    | "LINKEDIN"
    | "WEBSITE"
    | "OTHER";
  displayName: string | null;
  profileUrl: string | null;
  verified: boolean;
  linkedAt: string;
  metadata: Record<string, unknown> | null;
};

export type ModerationAction = {
  id: string;
  type: "WARNING" | "TEMP_BAN" | "PERM_BAN" | "NOTE";
  reason: string;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
};

export type ProfileModeration = {
  actions: ModerationAction[];
  trustLevel: TrustLevel;
};

export type ProfileProgress = {
  score: number;
  completed: number;
  total: number;
  missing: string[];
};

export type SignatureRules = {
  maxLength: number;
  mediaAllowed: boolean;
  htmlWhitelist: string[];
};

export type ProfileCounts = {
  followers: number;
  following: number;
};

export type ProfileActivity = {
  threads: unknown[];
  posts: unknown[];
  reactions: unknown[];
  lastActiveAt: string | null;
};

export type ViewerInfo = {
  isSelf: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  following: boolean;
  canMessage: boolean;
};

export type ProfileSettings = {
  privacy: {
    showEmail: boolean;
    showLastOnline: boolean;
    showBirthday: boolean;
    showLocation: boolean;
    showPronouns: boolean;
    allowMessages: boolean;
    allowTagging: boolean;
    blockedUsers: string[];
    updatedAt: string;
  } | null;
  notifications: {
    emailMentions: boolean;
    emailFollows: boolean;
    emailDigest: boolean;
    pushMentions: boolean;
    pushReplies: boolean;
    pushFollows: boolean;
    watchedThreads: unknown;
    updatedAt: string;
  } | null;
  appearance: {
    theme: "LIGHT" | "DARK" | "SYSTEM";
    density: "COMFORTABLE" | "COMPACT";
    accent: string | null;
    language: string | null;
    timeFormat: "H12" | "H24";
    updatedAt: string;
  } | null;
};

export type ProfileCore = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  coverImage: string | null;
  bio: string | null;
  about: string | null;
  interests: string | null;
  role: Role;
  signature: string | null;
  language: string | null;
  stats: ProfileStats;
  metadata: ProfileMetadata;
  contact: ProfileContact;
  badges: ProfileBadge[];
  customBadges: CustomBadge[];
  connectedAccounts: ConnectedAccount[];
  counts: ProfileCounts;
  activity: ProfileActivity;
  progress: ProfileProgress;
  verification: { email: boolean; badge: boolean };
  signatureRules: SignatureRules;
  moderation: ProfileModeration;
};

export type UserProfileResponse = {
  profile: ProfileCore;
  viewer: ViewerInfo;
  settings: ProfileSettings | null;
};

export type UpdateProfilePayload = {
  displayName?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  location?: string | null;
  timezone?: string | null;
  website?: string | null;
  language?: string | null;
  signature?: string | null;
  avatarUrl?: string | null;
  coverImage?: string | null;
  birthday?: string | null;
  socials?: ProfileSocial[];
  links?: ProfileLink[];
  about?: string | null;
  interests?: string | null;
  privacy?: {
    showEmail?: boolean;
    showLastOnline?: boolean;
    showBirthday?: boolean;
    showLocation?: boolean;
    showPronouns?: boolean;
    allowMessages?: boolean;
    allowTagging?: boolean;
    blockedUsers?: string[];
  };
  notifications?: {
    emailMentions?: boolean;
    emailFollows?: boolean;
    emailDigest?: boolean;
    pushMentions?: boolean;
    pushReplies?: boolean;
    pushFollows?: boolean;
    watchedThreads?: string[];
  };
  appearance?: {
    theme?: "LIGHT" | "DARK" | "SYSTEM";
    density?: "COMFORTABLE" | "COMPACT";
    accent?: string | null;
    language?: string | null;
    timeFormat?: "H12" | "H24";
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const jsonOrError = async <T>(res: Response) => {
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (isRecord(data) && typeof data.message === "string" ? data.message : undefined) ??
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
};

export async function getProfile(handle: string, includeSettings = false) {
  const { accessToken } = useUserStore.getState();
  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = new URL(`${API}/users/${encodeURIComponent(handle)}`);
  if (includeSettings) {
    url.searchParams.set("includeSettings", "true");
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers,
    credentials: "include",
  });

  return jsonOrError<UserProfileResponse>(res);
}

export async function updateProfile(handle: string, payload: UpdateProfilePayload) {
  return fetchWithAuth(`${API}/users/${encodeURIComponent(handle)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) as Promise<UserProfileResponse>;
}

export async function followProfile(handle: string) {
  return fetchWithAuth(`${API}/users/${encodeURIComponent(handle)}/follow`, {
    method: "POST",
  }) as Promise<{ ok: boolean; counts: ProfileCounts }>;
}

export async function unfollowProfile(handle: string) {
  return fetchWithAuth(`${API}/users/${encodeURIComponent(handle)}/follow`, {
    method: "DELETE",
  }) as Promise<{ ok: boolean; counts: ProfileCounts }>;
}
