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

  const density = useUiStore((state) => state.density);

  if (loading && trending.length === 0) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5 data-[density=compact]:space-y-3 2xl:space-y-6" data-density={density}>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Flame className="h-4 w-4 text-orange-400" /> Trends
      </h2>
      <div className="space-y-4 md:space-y-5 data-[density=compact]:space-y-3 2xl:space-y-6" data-density={density}>
        {trending.map((thread) => (
          <Link
            key={thread.id}
            to={`/thread/${thread.id}`}
            data-density={density}
            className="group flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/60 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur transition hover:border-primary/60 supports-[backdrop-filter]:bg-background/70 md:p-6 2xl:p-7 data-[density=compact]:gap-3 data-[density=compact]:rounded-2xl data-[density=compact]:p-4"
          >
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="h-4 w-4" /> {thread.tags?.[0] ?? "Thread"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatRelativeTime(thread.updatedAt)}
              </span>
            </div>
            <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground transition group-hover:text-primary 2xl:text-[1.35rem]">
              {thread.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="accent" className="rounded-full px-2.5 py-0.5">
                {thread.replies} Antworten
              </Badge>
              <span>{thread.views.toLocaleString("de-DE")} Views</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SidebarRightTrends;
