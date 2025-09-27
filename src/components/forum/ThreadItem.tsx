import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/time";
import type { ThreadWithMeta } from "@/lib/api/types";
import { MessageSquare, Eye, Flame } from "lucide-react";

const ThreadItem = ({ thread }: { thread: ThreadWithMeta }) => (
  <Link
    to={`/thread/${thread.id}`}
    className="group relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-5 transition hover:border-primary/60"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Badge variant="accent" className="capitalize">
          {thread.tags?.[0] ?? "Thread"}
        </Badge>
        <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
          {thread.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          Zuletzt von <span className="font-semibold">{thread.lastPosterId}</span> kommentiert • {formatRelativeTime(thread.lastPostAt)}
        </p>
      </div>
      <Flame className="h-5 w-5 text-orange-400" />
    </div>
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <MessageSquare className="h-4 w-4" /> {thread.replies} Antworten
      </span>
      <span className="flex items-center gap-1">
        <Eye className="h-4 w-4" /> {thread.views.toLocaleString("de-DE")} Views
      </span>
      <span>{formatRelativeTime(thread.updatedAt)} aktualisiert</span>
    </div>
  </Link>
);

export default ThreadItem;
