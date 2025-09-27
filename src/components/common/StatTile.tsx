import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}

const StatTile = ({ label, value, icon: Icon, accent = "from-primary/40 to-secondary/40" }: StatTileProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString("de-DE"));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [count, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4", "glass-panel")}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/10 opacity-40" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <motion.span className="text-2xl font-semibold">{rounded}</motion.span>
        </div>
        <span className={cn("rounded-full bg-gradient-to-br p-2 text-primary", accent)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
};

export default StatTile;
