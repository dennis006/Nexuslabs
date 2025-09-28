import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/store/uiStore";

interface StatTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
  locale?: string;
}

const StatTile = ({ label, value, icon: Icon, accent = "from-primary/40 to-secondary/40", locale = "de-DE" }: StatTileProps) => {
  const density = useUiStore((state) => state.density);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString(locale));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [count, value]);

  useEffect(() => {
    rounded.set(Math.round(count.get()).toLocaleString(locale));
  }, [locale, rounded, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur supports-[backdrop-filter]:bg-card/60",
        density === "compact" && "p-4"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/10 opacity-40" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <motion.span className="text-3xl font-semibold tracking-tight">{rounded}</motion.span>
        </div>
        <span className={cn("rounded-full bg-gradient-to-br p-2 text-primary", accent)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
};

export default StatTile;
