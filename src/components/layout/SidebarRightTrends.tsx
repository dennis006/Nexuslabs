import { useEffect, useState } from "react";
import { Flame, Hash, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { mockApi } from "@/lib/api/mockApi";
import type { ThreadWithMeta } from "@/lib/api/types";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/time";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";

const SidebarRightTrends = () => {
  const [trending, setTrending] = useState<ThreadWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getThreads({ sort: "hottest", pageSize: 5 });
      setTrending(response.data);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && trending.length === 0) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const density = useUiStore((state) => state.density);

  return (
    <aside className="space-y-4" data-density={density}>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Flame className="h-4 w-4 text-orange-400" /> Trends
      </h2>
      <div
        className={cn("space-y-4", density === "compact" && "space-y-3")}
        data-density={density}
      >
        {trending.map((thread) => (
          <Link
            key={thread.id}
            to={`/thread/${thread.id}`}
            className={cn(
              "flex flex-col gap-3 rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur transition hover:border-primary/60 supports-[backdrop-filter]:bg-card/60",
              density === "compact" && "rounded-2xl p-4"
            )}
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="h-4 w-4" /> {thread.tags?.[0] ?? "Thread"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatRelativeTime(thread.updatedAt)}
              </span>
            </div>
            <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground">{thread.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="accent" className="rounded-full px-2.5 py-0.5">
                {thread.replies} Antworten
              </Badge>
              <span>{thread.views.toLocaleString("de-DE")} Views</span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default SidebarRightTrends;
