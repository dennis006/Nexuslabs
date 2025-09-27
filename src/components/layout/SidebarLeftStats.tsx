import { useEffect, useState } from "react";
import { Users, Flame, Hash, MessageSquare, TrendingUp } from "lucide-react";
import StatTile from "@/components/common/StatTile";
import { mockApi } from "@/lib/api/mockApi";
import type { Stats } from "@/lib/api/types";
import { usePresenceStore } from "@/store/presenceStore";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";

const SidebarLeftStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const online = usePresenceStore((state) => state.onlineCount);

  const load = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getStats();
      setStats(data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  return (
    <aside className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Statistik
      </h2>
      <div className="space-y-3">
        <StatTile label="Registrierte Nutzer" value={stats.usersTotal} icon={Users} />
        <StatTile label="Gerade online" value={online} icon={Flame} accent="from-amber-400/40 to-red-500/40" />
        <StatTile label="Kategorien" value={stats.categoriesTotal} icon={Hash} accent="from-primary/40 to-primary/10" />
        <StatTile label="Threads" value={stats.threadsTotal} icon={TrendingUp} accent="from-secondary/40 to-secondary/10" />
        <StatTile label="Beiträge" value={stats.postsTotal} icon={MessageSquare} accent="from-emerald-400/40 to-primary/10" />
      </div>
    </aside>
  );
};

export default SidebarLeftStats;
