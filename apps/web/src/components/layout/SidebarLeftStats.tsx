import { useCallback, useEffect, useState } from "react";
import { Users, Flame, Hash, MessageSquare, TrendingUp } from "lucide-react";
import StatTile from "@/components/common/StatTile";
import { mockApi } from "@/lib/api/mockApi";
import type { Stats } from "@/lib/api/types";
import { usePresenceStore } from "@/store/presenceStore";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const SidebarLeftStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const online = usePresenceStore((state) => state.onlineCount);
  const { t, locale } = useTranslation();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockApi.getStats();
      setStats(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.error.generic"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 20000);
    return () => clearInterval(interval);
  }, [load]);

  const density = useUiStore((state) => state.density);

  if (loading && !stats) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  return (
    <div className="space-y-5 data-[density=compact]:space-y-3 2xl:space-y-6" data-density={density}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("stats.heading")}</h2>
      <div
        data-density={density}
        className={cn(
          "grid grid-cols-2 gap-4 md:gap-5",
          "data-[density=compact]:gap-3 md:data-[density=compact]:gap-4"
        )}
      >
        <StatTile label={t("stats.registered")} value={stats.usersTotal} icon={Users} locale={locale} />
        <StatTile
          label={t("stats.online")}
          value={online}
          icon={Flame}
          accent="from-amber-400/40 to-red-500/40"
          locale={locale}
        />
        <StatTile
          label={t("stats.categories")}
          value={stats.categoriesTotal}
          icon={Hash}
          accent="from-primary/40 to-primary/10"
          locale={locale}
        />
        <StatTile
          label={t("stats.threads")}
          value={stats.threadsTotal}
          icon={TrendingUp}
          accent="from-secondary/40 to-secondary/10"
          locale={locale}
        />
        <StatTile
          label={t("stats.posts")}
          value={stats.postsTotal}
          icon={MessageSquare}
          accent="from-emerald-400/40 to-primary/10"
          locale={locale}
        />
      </div>
    </div>
  );
};

export default SidebarLeftStats;
