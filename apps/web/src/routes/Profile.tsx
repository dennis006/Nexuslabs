import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  followProfile,
  getProfile,
  type ProfileContact,
  type ProfileCore,
  type ProfileLink,
  type ProfileSocial,
  type ProfileStats,
  type ProfileSettings,
  type TrustLevel,
  type UpdateProfilePayload,
  unfollowProfile,
  updateProfile,
  type UserProfileResponse,
} from "@/lib/api/profileApi";
import { useUserStore } from "@/store/userStore";
import { useUiStore } from "@/store/uiStore";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/utils/time";
import { cn } from "@/lib/utils/cn";
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  Globe2,
  Link2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  PencilLine,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { nanoid } from "nanoid";

const MAX_SOCIALS = 6;
const MAX_LINKS = 6;

type FormState = UpdateProfilePayload & {
  socials: ProfileSocial[];
  links: ProfileLink[];
};

const DEFAULT_FORM: FormState = {
  displayName: "",
  bio: "",
  pronouns: "",
  location: "",
  timezone: "",
  website: "",
  language: "",
  signature: "",
  avatarUrl: null,
  coverImage: null,
  birthday: null,
  socials: [],
  links: [],
  about: "",
  interests: "",
  privacy: undefined,
  notifications: undefined,
  appearance: undefined,
};

const createEmptySocial = (): ProfileSocial => ({ id: nanoid(), url: "" });
const createEmptyLink = (): ProfileLink => ({ label: "", url: "" });

type PrivacyFieldKey = keyof NonNullable<FormState["privacy"]>;
const PRIVACY_FIELDS: Array<{ key: PrivacyFieldKey; label: TranslationKey }> = [
  { key: "showEmail", label: "profile.settings.privacy.showEmail" },
  { key: "showLastOnline", label: "profile.settings.privacy.showLastOnline" },
  { key: "showBirthday", label: "profile.settings.privacy.showBirthday" },
  { key: "showLocation", label: "profile.settings.privacy.showLocation" },
  { key: "showPronouns", label: "profile.settings.privacy.showPronouns" },
  { key: "allowMessages", label: "profile.settings.privacy.allowMessages" },
  { key: "allowTagging", label: "profile.settings.privacy.allowTagging" },
];

type NotificationFieldKey = keyof NonNullable<FormState["notifications"]>;
const NOTIFICATION_FIELDS: Array<{ key: NotificationFieldKey; label: TranslationKey }> = [
  { key: "emailMentions", label: "profile.settings.notifications.emailMentions" },
  { key: "emailFollows", label: "profile.settings.notifications.emailFollows" },
  { key: "emailDigest", label: "profile.settings.notifications.emailDigest" },
  { key: "pushMentions", label: "profile.settings.notifications.pushMentions" },
  { key: "pushReplies", label: "profile.settings.notifications.pushReplies" },
  { key: "pushFollows", label: "profile.settings.notifications.pushFollows" },
];

const Profile = () => {
  const { handle = "" } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { t, language, locale } = useTranslation();
  const viewer = useUserStore((state) => state.user);
  const updateViewer = useUserStore((state) => state.updateUser);
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const sanitizedHandle = useMemo(() => handle.replace(/^@/, ""), [handle]);
  const maxBirthday = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const canEdit = Boolean(data?.viewer.canEdit);

  const applyProfileToForm = useCallback((profile: ProfileCore, settings: ProfileSettings | null) => {
    const contact: ProfileContact = profile.contact;
    setForm({
      displayName: profile.displayName,
      bio: profile.bio,
      pronouns: contact.pronouns,
      location: profile.metadata.location,
      timezone: profile.metadata.timezone,
      website: contact.website,
      language: profile.language,
      signature: profile.signature,
      avatarUrl: profile.avatarUrl,
      coverImage: profile.coverImage,
      birthday: profile.metadata.birthday,
      socials: contact.socials.length > 0 ? contact.socials : [],
      links: contact.links.length > 0 ? contact.links : [],
      about: profile.about,
      interests: profile.interests,
      privacy: settings?.privacy
        ? {
            showEmail: settings.privacy.showEmail,
            showLastOnline: settings.privacy.showLastOnline,
            showBirthday: settings.privacy.showBirthday,
            showLocation: settings.privacy.showLocation,
            showPronouns: settings.privacy.showPronouns,
            allowMessages: settings.privacy.allowMessages,
            allowTagging: settings.privacy.allowTagging,
            blockedUsers: settings.privacy.blockedUsers,
          }
        : undefined,
      notifications: settings?.notifications
        ? {
            emailMentions: settings.notifications.emailMentions,
            emailFollows: settings.notifications.emailFollows,
            emailDigest: settings.notifications.emailDigest,
            pushMentions: settings.notifications.pushMentions,
            pushReplies: settings.notifications.pushReplies,
            pushFollows: settings.notifications.pushFollows,
            watchedThreads: Array.isArray(settings.notifications.watchedThreads)
              ? (settings.notifications.watchedThreads as string[])
              : undefined,
          }
        : undefined,
      appearance: settings?.appearance
        ? {
            theme: settings.appearance.theme,
            density: settings.appearance.density,
            accent: settings.appearance.accent,
            language: settings.appearance.language,
            timeFormat: settings.appearance.timeFormat,
          }
        : undefined,
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProfile(sanitizedHandle, true);
      setData(response);
      if (response.profile && response.settings) {
        applyProfileToForm(response.profile, response.settings);
      } else if (response.profile) {
        applyProfileToForm(response.profile, null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applyProfileToForm, sanitizedHandle]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const profile = data?.profile;
  const appearanceTheme = data?.settings?.appearance?.theme ?? null;
  const appearanceDensity = data?.settings?.appearance?.density ?? null;

  useEffect(() => {
    if (profile && data?.settings) {
      applyProfileToForm(profile, data.settings);
    }
  }, [profile, data?.settings, applyProfileToForm]);

  const isOwnProfile = Boolean(viewer && profile && viewer.username.toLowerCase() === profile.handle.toLowerCase());

  useEffect(() => {
    if (!isOwnProfile) {
      return;
    }
    if (!appearanceTheme && !appearanceDensity) {
      return;
    }
    const uiState = useUiStore.getState();
    if (appearanceTheme) {
      const normalizedTheme =
        appearanceTheme === "SYSTEM"
          ? "system"
          : appearanceTheme === "DARK"
            ? "dark"
            : "light";
      if (uiState.theme !== normalizedTheme) {
        uiState.setTheme(normalizedTheme);
      }
    }
    if (appearanceDensity) {
      const normalizedDensity = appearanceDensity === "COMPACT" ? "compact" : "comfortable";
      if (uiState.density !== normalizedDensity) {
        uiState.setDensity(normalizedDensity);
      }
    }
  }, [appearanceTheme, appearanceDensity, isOwnProfile]);

  const followerCount = profile?.counts.followers ?? 0;
  const followingCount = profile?.counts.following ?? 0;

  const handleFollowToggle = async () => {
    if (!profile || !data) return;
    if (!viewer) {
      navigate(`/login?redirectTo=/u/${profile.handle}`);
      return;
    }
    setFollowLoading(true);
    try {
      if (data.viewer.following) {
        const res = await unfollowProfile(profile.handle);
        setData({
          ...data,
          viewer: { ...data.viewer, following: false },
          profile: {
            ...data.profile,
            counts: { followers: res.counts.followers, following: data.profile.counts.following },
          },
        });
        toast.success(t("profile.follow.unfollowed"));
      } else {
        const res = await followProfile(profile.handle);
        setData({
          ...data,
          viewer: { ...data.viewer, following: true },
          profile: {
            ...data.profile,
            counts: { followers: res.counts.followers, following: data.profile.counts.following },
          },
        });
        toast.success(t("profile.follow.followed"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      toast.error(message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFormChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (index: number, patch: Partial<ProfileSocial>) => {
    setForm((prev) => {
      const socials = [...(prev.socials ?? [])];
      socials[index] = { ...socials[index], ...patch };
      return { ...prev, socials };
    });
  };

  const handleLinkChange = (index: number, patch: Partial<ProfileLink>) => {
    setForm((prev) => {
      const links = [...(prev.links ?? [])];
      links[index] = { ...links[index], ...patch };
      return { ...prev, links };
    });
  };

  const removeSocial = (index: number) => {
    setForm((prev) => {
      const socials = [...(prev.socials ?? [])];
      socials.splice(index, 1);
      return { ...prev, socials };
    });
  };

  const removeLink = (index: number) => {
    setForm((prev) => {
      const links = [...(prev.links ?? [])];
      links.splice(index, 1);
      return { ...prev, links };
    });
  };

  const handlePrivacyToggle = (key: PrivacyFieldKey, value: boolean) => {
    setForm((prev) => {
      const nextPrivacy = { ...(prev.privacy ?? {}) } as NonNullable<FormState["privacy"]>;
      nextPrivacy[key] = value;
      return { ...prev, privacy: nextPrivacy };
    });
  };

  const handleNotificationToggle = (key: NotificationFieldKey, value: boolean) => {
    setForm((prev) => {
      const nextNotifications = { ...(prev.notifications ?? {}) } as NonNullable<FormState["notifications"]>;
      nextNotifications[key] = value;
      return { ...prev, notifications: nextNotifications };
    });
  };

  type AppearanceFieldKey = keyof NonNullable<FormState["appearance"]>;
  const handleAppearanceChange = <K extends AppearanceFieldKey>(
    key: K,
    value: NonNullable<FormState["appearance"]>[K]
  ) => {
    setForm((prev) => {
      if (!prev.appearance) {
        return prev;
      }
      return {
        ...prev,
        appearance: { ...prev.appearance, [key]: value },
      };
    });
  };

  const buildPayload = (): UpdateProfilePayload => {
    const trim = (value: string | null | undefined) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const next = value.trim();
      return next.length === 0 ? null : next;
    };

    const payload: UpdateProfilePayload = {
      displayName: trim(form.displayName ?? null) ?? null,
      bio: trim(form.bio ?? null) ?? null,
      pronouns: trim(form.pronouns ?? null) ?? null,
      location: trim(form.location ?? null) ?? null,
      timezone: trim(form.timezone ?? null) ?? null,
      website: trim(form.website ?? null) ?? null,
      language: trim(form.language ?? null) ?? null,
      signature: trim(form.signature ?? null) ?? null,
      about: trim(form.about ?? null) ?? null,
      interests: trim(form.interests ?? null) ?? null,
      avatarUrl: trim(form.avatarUrl ?? null) ?? null,
      coverImage: trim(form.coverImage ?? null) ?? null,
      birthday: form.birthday ?? null,
    };

    if (form.socials && form.socials.length > 0) {
      payload.socials = form.socials
        .map((social) => ({
          ...social,
          url: social.url.trim(),
          label: social.label?.trim(),
          handle: social.handle?.trim() ?? null,
          icon: social.icon?.trim() ?? null,
        }))
        .filter((item) => item.url.length > 0);
    } else {
      payload.socials = [];
    }

    if (form.links && form.links.length > 0) {
      payload.links = form.links
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((item) => item.url.length > 0);
    } else {
      payload.links = [];
    }

    if (form.privacy) {
      payload.privacy = { ...form.privacy };
    }

    if (form.notifications) {
      payload.notifications = { ...form.notifications };
    }

    if (form.appearance) {
      payload.appearance = { ...form.appearance };
    }

    return payload;
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      const updated = await updateProfile(profile.handle, payload);
      setData(updated);
      if (updated.profile && updated.settings) {
        applyProfileToForm(updated.profile, updated.settings);
      }
      toast.success(t("profile.edit.success"));
      if (isOwnProfile && updated.profile) {
        updateViewer({
          displayName: updated.profile.displayName,
          avatarUrl: updated.profile.avatarUrl,
          pronouns: updated.profile.contact.pronouns,
          timezone: updated.profile.metadata.timezone,
          language: updated.profile.language,
          lastSeenAt: updated.profile.metadata.lastOnline,
          reputation: updated.profile.stats.reputation,
          trustLevel: updated.profile.stats.trustLevel,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const renderStat = (value: number, label: string, icon: ReactNode) => (
    <Card className="flex-1 min-w-[140px]">
      <CardHeader className="pb-2 flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle className="text-2xl">{value.toLocaleString()}</CardTitle>
          <CardDescription>{label}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

const renderMetadataItem = (
  icon: ReactNode,
  label: string,
  value: string | null,
  fallbackKey: TranslationKey
) => (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">
          {value ?? t(fallbackKey)}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <Skeleton className="h-52 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <Shield className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold">{t("profile.error.title")}</h1>
        <p className="text-muted-foreground">{error ?? t("profile.error.description")}</p>
        <Button onClick={() => void loadProfile()}>{t("profile.action.retry")}</Button>
      </div>
    );
  }

  const stats: ProfileStats = profile.stats;
  const trustLabels: Record<TrustLevel, TranslationKey> = {
    NEWCOMER: "profile.trustLevel.newcomer",
    MEMBER: "profile.trustLevel.member",
    CONTRIBUTOR: "profile.trustLevel.contributor",
    VETERAN: "profile.trustLevel.veteran",
    MODERATOR: "profile.trustLevel.moderator",
    ADMINISTRATOR: "profile.trustLevel.administrator",
  };
  const trustLabel = t(trustLabels[stats.trustLevel]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
        <div
          className={cn(
            "h-40 w-full bg-cover bg-center",
            profile.coverImage ? "" : "bg-gradient-to-r from-primary/20 to-primary/5"
          )}
          style={profile.coverImage ? { backgroundImage: `url(${profile.coverImage})` } : undefined}
        />
        <div className="flex flex-col gap-6 px-6 pb-6 pt-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="-mt-16 h-32 w-32 overflow-hidden rounded-2xl border-4 border-background shadow-xl">
              <Avatar className="h-32 w-32">
                {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.displayName} /> : null}
                <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  {profile.displayName}
                </h1>
                <Badge variant={profile.role === "ADMIN" ? "default" : "secondary"} className="flex items-center gap-1">
                  {profile.role === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {profile.role === "ADMIN" ? t("profile.role.admin") : t("profile.role.member")}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {trustLabel}
                </Badge>
                {profile.verification.badge ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t("profile.verification.badge")}
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <AtSign className="h-4 w-4" />@{profile.handle}
                </span>
                {profile.contact.pronouns ? (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {profile.contact.pronouns}
                  </span>
                ) : null}
                {profile.metadata.localTime ? (
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-4 w-4" />
                    {profile.metadata.localTime}
                  </span>
                ) : null}
              </div>
              {profile.bio ? <p className="max-w-3xl text-base text-muted-foreground">{profile.bio}</p> : null}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("profile.network.followers", { count: followerCount })}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("profile.network.following", { count: followingCount })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {!isOwnProfile && data.viewer.canMessage ? (
                <Button variant="secondary" disabled>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("profile.action.message")}
                </Button>
              ) : null}
              {!isOwnProfile ? (
                <Button onClick={handleFollowToggle} disabled={followLoading}>
                  {followLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : data.viewer.following ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  {data.viewer.following ? t("profile.following") : t("profile.follow")}
                </Button>
              ) : (
                <Button onClick={() => setActiveTab("settings")}
                  variant="default">
                  <Edit3 className="mr-2 h-4 w-4" />
                  {t("profile.edit.cta")}
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
              <div className="flex items-center justify-between gap-6">
                <span className="font-medium text-muted-foreground">{t("profile.progress.title")}</span>
                <span className="font-semibold">{profile.progress.score}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(profile.progress.score, 100)}%` }}
                />
              </div>
              {profile.progress.missing.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("profile.progress.missing", { fields: profile.progress.missing.join(", ") })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {renderStat(stats.topics, t("profile.stats.topics"), <Sparkles className="h-5 w-5" />)}
        {renderStat(stats.posts, t("profile.stats.posts"), <MessageCircle className="h-5 w-5" />)}
        {renderStat(stats.likesReceived, t("profile.stats.likesReceived"), <Star className="h-5 w-5" />)}
        {renderStat(stats.reputation, t("profile.stats.reputation"), <Trophy className="h-5 w-5" />)}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
        <TabsList className="w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="about" className="rounded-full border border-border/60 px-4 py-2">
            {t("profile.tabs.about")}
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-full border border-border/60 px-4 py-2">
            {t("profile.tabs.activity")}
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-full border border-border/60 px-4 py-2">
            {t("profile.tabs.badges")}
          </TabsTrigger>
          <TabsTrigger value="network" className="rounded-full border border-border/60 px-4 py-2">
            {t("profile.tabs.network")}
          </TabsTrigger>
          {canEdit ? (
            <TabsTrigger value="settings" className="rounded-full border border-border/60 px-4 py-2">
              {t("profile.tabs.settings")}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.about.title")}</CardTitle>
                <CardDescription>{t("profile.about.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("profile.about.bio")}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {profile.about ?? profile.bio ?? t("profile.about.empty")}
                  </p>
                </section>
                <Separator />
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("profile.about.interests")}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {profile.interests ?? t("profile.about.empty")}
                  </p>
                </section>
                <Separator />
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("profile.signature.title")}
                  </h3>
                  {profile.signature ? (
                    <p className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed">
                      {profile.signature}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("profile.signature.empty")}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("profile.signature.rules", { max: profile.signatureRules.maxLength })}
                  </p>
                </section>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.metadata.title")}</CardTitle>
                  <CardDescription>{t("profile.metadata.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {renderMetadataItem(
                    <CalendarDays className="h-5 w-5" />,
                    t("profile.metadata.joined"),
                    formatDateTime(profile.metadata.joinedAt, locale),
                    "profile.metadata.private"
                  )}
                  {renderMetadataItem(
                    <Clock3 className="h-5 w-5" />,
                    t("profile.metadata.lastOnline"),
                    profile.metadata.lastOnline ? formatRelativeTime(profile.metadata.lastOnline, language) : null,
                    "profile.metadata.private"
                  )}
                  {renderMetadataItem(
                    <MapPin className="h-5 w-5" />,
                    t("profile.metadata.location"),
                    profile.metadata.location,
                    "profile.metadata.private"
                  )}
                  {renderMetadataItem(
                    <Globe2 className="h-5 w-5" />,
                    t("profile.metadata.timezone"),
                    profile.metadata.timezone,
                    "profile.metadata.private"
                  )}
                  {renderMetadataItem(
                    <Mail className="h-5 w-5" />,
                    t("profile.metadata.email"),
                    profile.metadata.email,
                    "profile.metadata.private"
                  )}
                  {renderMetadataItem(
                    <CalendarDays className="h-5 w-5" />,
                    t("profile.metadata.birthday"),
                    profile.metadata.birthday ? formatDate(profile.metadata.birthday, locale) : null,
                    "profile.metadata.private"
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.contact.title")}</CardTitle>
                  <CardDescription>{t("profile.contact.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {profile.contact.website ? (
                    <a
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      href={profile.contact.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe2 className="h-4 w-4" />
                      {profile.contact.website}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("profile.contact.noWebsite")}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("profile.contact.socials")}
                    </p>
                    {profile.contact.socials.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {profile.contact.socials.map((social) => (
                          <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary"
                          >
                            <Link2 className="h-4 w-4" />
                            <span className="font-medium">{social.label ?? social.url}</span>
                            {social.handle ? <span className="text-muted-foreground">({social.handle})</span> : null}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("profile.contact.noSocials")}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("profile.contact.links")}
                    </p>
                    {profile.contact.links.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {profile.contact.links.map((link, idx) => (
                          <a
                            key={`${link.url}-${idx}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary"
                          >
                            <Link2 className="h-4 w-4" />
                            <span className="font-medium">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("profile.contact.noLinks")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.moderation.title")}</CardTitle>
                  <CardDescription>{t("profile.moderation.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {profile.moderation.actions.length > 0 ? (
                    profile.moderation.actions.map((action) => (
                      <div
                        key={action.id}
                        className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{action.type}</Badge>
                          <span className="text-muted-foreground">
                            {formatDateTime(action.createdAt, locale)}
                          </span>
                        </div>
                        <p>{action.reason}</p>
                        {!action.active && action.expiresAt ? (
                          <p className="text-xs text-muted-foreground">
                            {t("profile.moderation.expired", { time: formatDateTime(action.expiresAt, locale) })}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("profile.moderation.empty")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.activity.title")}</CardTitle>
              <CardDescription>{t("profile.activity.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                {t("profile.activity.empty")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.badges.official")}</CardTitle>
                <CardDescription>{t("profile.badges.officialHint")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {profile.badges.length > 0 ? (
                  profile.badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{badge.badge.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{badge.badge.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.badges.earned", { date: formatDateTime(badge.earnedAt, locale) })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    {t("profile.badges.empty")}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.badges.custom")}</CardTitle>
                <CardDescription>{t("profile.badges.customHint")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {profile.customBadges.length > 0 ? (
                  profile.customBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{badge.label ?? badge.url}</p>
                        <p className="text-xs text-muted-foreground">{badge.handle ?? badge.url}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("profile.badges.customEmpty")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.network.title")}</CardTitle>
                <CardDescription>{t("profile.network.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  {t("profile.network.empty")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.connected.title")}</CardTitle>
                <CardDescription>{t("profile.connected.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {profile.connectedAccounts.length > 0 ? (
                  profile.connectedAccounts.map((account) => (
                    <a
                      key={account.id}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm hover:border-primary"
                      href={account.profileUrl ?? undefined}
                      target={account.profileUrl ? "_blank" : undefined}
                      rel={account.profileUrl ? "noreferrer" : undefined}
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">{account.displayName ?? account.provider}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.provider.toLowerCase()}
                        </p>
                      </div>
                      {account.verified ? <Check className="h-4 w-4 text-primary" /> : null}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("profile.connected.empty")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canEdit ? (
          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.settings.profile.title")}</CardTitle>
                  <CardDescription>{t("profile.settings.profile.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.displayName")}</label>
                      <Input
                        value={form.displayName ?? ""}
                        onChange={(event) => handleFormChange("displayName", event.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.pronouns")}</label>
                      <Input
                        value={form.pronouns ?? ""}
                        onChange={(event) => handleFormChange("pronouns", event.target.value)}
                        maxLength={32}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.location")}</label>
                      <Input
                        value={form.location ?? ""}
                        onChange={(event) => handleFormChange("location", event.target.value)}
                        maxLength={120}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.timezone")}</label>
                      <Input
                        value={form.timezone ?? ""}
                        onChange={(event) => handleFormChange("timezone", event.target.value)}
                        placeholder="Europe/Berlin"
                        maxLength={64}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.website")}</label>
                      <Input
                        value={form.website ?? ""}
                        onChange={(event) => handleFormChange("website", event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.language")}</label>
                      <Input
                        value={form.language ?? ""}
                        onChange={(event) => handleFormChange("language", event.target.value)}
                        placeholder="de"
                        maxLength={8}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{t("profile.form.birthday")}</label>
                      <Input
                        type="date"
                        value={form.birthday ? form.birthday.slice(0, 10) : ""}
                        max={maxBirthday}
                        onChange={(event) => {
                          const { value } = event.target;
                          handleFormChange(
                            "birthday",
                            value ? new Date(`${value}T00:00:00Z`).toISOString() : null
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("profile.form.bio")}</label>
                    <Textarea
                      value={form.bio ?? ""}
                      onChange={(event) => handleFormChange("bio", event.target.value)}
                      maxLength={280}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("profile.form.about")}</label>
                    <Textarea
                      value={form.about ?? ""}
                      onChange={(event) => handleFormChange("about", event.target.value)}
                      maxLength={1200}
                      rows={6}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("profile.form.interests")}</label>
                    <Textarea
                      value={form.interests ?? ""}
                      onChange={(event) => handleFormChange("interests", event.target.value)}
                      maxLength={600}
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("profile.form.signature")}</label>
                    <Textarea
                      value={form.signature ?? ""}
                      onChange={(event) => handleFormChange("signature", event.target.value)}
                      maxLength={profile.signatureRules.maxLength}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("profile.signature.rules", { max: profile.signatureRules.maxLength })}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("profile.form.socials")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            socials: [...(prev.socials ?? []), createEmptySocial()],
                          }))
                        }
                        disabled={(form.socials?.length ?? 0) >= MAX_SOCIALS}
                      >
                        <PlusIcon className="mr-1 h-4 w-4" />
                        {t("profile.form.addSocial")}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {form.socials?.length ? (
                        form.socials.map((social, index) => (
                          <div key={social.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {t("profile.form.socialLabel")}
                              </label>
                              <Input
                                value={social.label ?? ""}
                                onChange={(event) => handleSocialChange(index, { label: event.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {t("profile.form.socialUrl")}
                              </label>
                              <Input
                                value={social.url}
                                onChange={(event) => handleSocialChange(index, { url: event.target.value })}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {t("profile.form.socialHandle")}
                              </label>
                              <Input
                                value={social.handle ?? ""}
                                onChange={(event) => handleSocialChange(index, { handle: event.target.value })}
                              />
                            </div>
                            <div className="flex items-end justify-between gap-2">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  {t("profile.form.socialIcon")}
                                </label>
                                <Input
                                  value={social.icon ?? ""}
                                  onChange={(event) => handleSocialChange(index, { icon: event.target.value })}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSocial(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("profile.contact.noSocials")}</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {t("profile.form.links")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            links: [...(prev.links ?? []), createEmptyLink()],
                          }))
                        }
                        disabled={(form.links?.length ?? 0) >= MAX_LINKS}
                      >
                        <PlusIcon className="mr-1 h-4 w-4" />
                        {t("profile.form.addLink")}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {form.links?.length ? (
                        form.links.map((link, index) => (
                          <div key={`${link.url}-${index}`} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                {t("profile.form.linkLabel")}
                              </label>
                              <Input
                                value={link.label}
                                onChange={(event) => handleLinkChange(index, { label: event.target.value })}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="flex flex-1 flex-col gap-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  {t("profile.form.linkUrl")}
                                </label>
                                <Input
                                  value={link.url}
                                  onChange={(event) => handleLinkChange(index, { url: event.target.value })}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLink(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("profile.contact.noLinks")}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.settings.privacy.title")}</CardTitle>
                    <CardDescription>{t("profile.settings.privacy.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.privacy ? (
                      PRIVACY_FIELDS.map(({ key, label }) => (
                        <label key={key} className="flex items-center justify-between gap-4 text-sm">
                          <span>{t(label)}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(form.privacy?.[key])}
                            onChange={(event) => handlePrivacyToggle(key, event.target.checked)}
                          />
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("profile.settings.unavailable")}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.settings.notifications.title")}</CardTitle>
                    <CardDescription>{t("profile.settings.notifications.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.notifications ? (
                      NOTIFICATION_FIELDS.map(({ key, label }) => (
                        <label key={key} className="flex items-center justify-between gap-4 text-sm">
                          <span>{t(label)}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(form.notifications?.[key])}
                            onChange={(event) => handleNotificationToggle(key, event.target.checked)}
                          />
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("profile.settings.unavailable")}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.settings.appearance.title")}</CardTitle>
                    <CardDescription>{t("profile.settings.appearance.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.appearance ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">{t("profile.settings.appearance.theme")}</label>
                          <select
                            className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                            value={form.appearance.theme ?? "SYSTEM"}
                            onChange={(event) =>
                              handleAppearanceChange(
                                "theme",
                                event.target.value === "LIGHT"
                                  ? "LIGHT"
                                  : event.target.value === "DARK"
                                    ? "DARK"
                                    : "SYSTEM"
                              )
                            }
                          >
                            <option value="LIGHT">{t("profile.settings.appearance.themeLight")}</option>
                            <option value="DARK">{t("profile.settings.appearance.themeDark")}</option>
                            <option value="SYSTEM">{t("profile.settings.appearance.themeSystem")}</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">{t("profile.settings.appearance.density")}</label>
                          <select
                            className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                            value={form.appearance.density ?? "COMFORTABLE"}
                            onChange={(event) =>
                              handleAppearanceChange(
                                "density",
                                event.target.value === "COMPACT" ? "COMPACT" : "COMFORTABLE"
                              )
                            }
                          >
                            <option value="COMFORTABLE">{t("profile.settings.appearance.densityComfort")}</option>
                            <option value="COMPACT">{t("profile.settings.appearance.densityCompact")}</option>
                          </select>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t("profile.settings.appearance.language")}</label>
                            <Input
                              value={form.appearance.language ?? ""}
                              onChange={(event) => handleAppearanceChange("language", event.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">{t("profile.settings.appearance.timeFormat")}</label>
                            <select
                              className="rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                              value={form.appearance.timeFormat ?? "H24"}
                              onChange={(event) =>
                                handleAppearanceChange(
                                  "timeFormat",
                                  event.target.value === "H12" ? "H12" : "H24"
                                )
                              }
                            >
                              <option value="H24">24h</option>
                              <option value="H12">12h</option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("profile.settings.unavailable")}</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("profile.settings.actions")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-3">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PencilLine className="mr-2 h-4 w-4" />}
                      {saving ? t("profile.edit.saving") : t("profile.edit.save")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (profile && data?.settings) {
                          applyProfileToForm(profile, data.settings);
                        }
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t("profile.edit.reset")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => <span className={className}>＋</span>;

export default Profile;
