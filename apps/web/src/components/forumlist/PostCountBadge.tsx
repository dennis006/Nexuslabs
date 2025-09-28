import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

export function PostCountBadge({
  count,
  label,
  className
}: {
  count: number;
  label?: string;
  className?: string;
}) {
  const { t, locale } = useTranslation();
  const displayLabel = label ?? t("forumlist.posts");
  return (
    <div
      className={cn(
        "flex h-16 w-16 flex-col items-center justify-center rounded-full bg-muted/30 text-center",
        "mx-auto",
        className
      )}
    >
      <div className="text-xl font-semibold tabular-nums">{count.toLocaleString(locale)}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{displayLabel}</div>
    </div>
  );
}
