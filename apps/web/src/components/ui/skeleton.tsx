import { cn } from "@/lib/utils/cn";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-lg bg-muted/40", className)}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

export { Skeleton };
