import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/time";
import type { ThreadWithMeta } from "@/lib/api/types";
import { MessageSquare, Eye, Flame } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const ThreadItem = ({ thread }: { thread: ThreadWithMeta }) => {
  const density = useUiStore((state) => state.density);
  const { t, locale, language } = useTranslation();

  return (
    <Link
      to={`/thread/${thread.id}`}
      data-density={density}
      className="group block rounded-none px-5 py-5 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary md:px-6 md:py-6 data-[density=compact]:px-4 data-[density=compact]:py-4"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Badge variant="accent" className="rounded-full px-2.5 py-0.5 text-xs capitalize">
              {thread.tags?.[0] ?? t("thread.defaultTag")}
            </Badge>
            <h3 className="text-lg font-semibold tracking-tight text-foreground transition group-hover:text-primary md:text-xl 2xl:text-[1.35rem]">
              {thread.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("thread.latestComment", {
                author: thread.lastPosterId,
                time: formatRelativeTime(thread.lastPostAt, language)
              })}
            </p>
          </div>
          <Flame className="mt-1 h-5 w-5 flex-shrink-0 text-orange-400" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> {t("thread.replies", { count: thread.replies.toLocaleString(locale) })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {t("thread.views", { count: thread.views.toLocaleString(locale) })}
          </span>
          <span className="flex items-center gap-1">
            {t("thread.updated", { time: formatRelativeTime(thread.updatedAt, language) })}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ThreadItem;
