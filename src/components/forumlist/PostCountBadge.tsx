import { cn } from "@/lib/utils/cn";

export function PostCountBadge({
  count,
  label = "posts",
  className
}: {
  count: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 flex-col items-center justify-center rounded-full bg-muted/30 text-center",
        "mx-auto",
        className
      )}
    >
      <div className="text-xl font-semibold tabular-nums">{count}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
