import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { hoverLift } from "@/lib/animations/framer";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import { Crosshair, Swords, Shield, Sparkles } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";

const iconMap: Record<string, LucideIcon> = {
  crosshair: Crosshair,
  swords: Swords,
  shield: Shield,
  sparkles: Sparkles
};

const CategoryCard = ({ category }: { category: Category }) => {
  const Icon = iconMap[category.icon ?? "sparkles"] ?? Sparkles;
  const density = useUiStore((state) => state.density);

  return (
    <motion.div variants={hoverLift} initial="rest" whileHover="hover" animate="rest" className="h-full">
      <Link
        to={`/forum/${category.id}`}
        className={cn(
          "flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-card/70 p-6 transition hover:border-primary/60 backdrop-blur supports-[backdrop-filter]:bg-card/60",
          density === "compact" && "gap-3 rounded-2xl p-4"
        )}
      >
        <div className="space-y-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="accent">{category.threadCount} Threads</Badge>
          <span>{category.postCount} Posts</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
