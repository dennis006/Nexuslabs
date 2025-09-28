import type { LastPost } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { formatDateTime } from "@/lib/utils/time";

type LastPostMetaProps = {
  data?: LastPost;
  className?: string;
  align?: "left" | "right";
};

export function LastPostMeta({ data, className, align = "right" }: LastPostMetaProps) {
  const textAlignment = align === "left" ? "text-left" : "text-right";
  const justify = align === "left" ? "justify-start" : "justify-end";
  const { t, locale } = useTranslation();

  if (!data) {
    return (
      <div className={cn("text-sm text-muted-foreground/70", textAlignment, className)}>
        {t("forumlist.noPosts")}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", justify, className)}>
      <img
        src={data.author.avatarUrl ?? "/avatar.png"}
        className="h-8 w-8 rounded-full ring-2 ring-background/70"
        alt={data.author.name}
      />
      <div className={cn("text-sm", textAlignment)}>
        <a className="block text-sm font-medium line-clamp-1 hover:underline" href="#">
          {data.threadTitle}
        </a>
        <p className="text-xs text-muted-foreground">
          {t("forumlist.lastPost", {
            author: data.author.name,
            time: formatDateTime(data.createdAt, locale)
          })}
        </p>
      </div>
    </div>
  );
}
