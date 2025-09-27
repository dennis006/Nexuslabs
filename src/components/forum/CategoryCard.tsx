import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { hoverLift } from "@/lib/animations/framer";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import { Crosshair, Swords, Shield, Sparkles } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

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
        data-density={density}
        className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-border/60 bg-background/60 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] transition hover:border-primary/60 supports-[backdrop-filter]:bg-background/70 md:p-6 2xl:p-7 data-[density=compact]:gap-4 data-[density=compact]:rounded-2xl data-[density=compact]:p-4"
      >
        <div className="space-y-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground 2xl:text-[1.35rem]">{category.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="accent">{category.threadCount} Threads</Badge>
          <span>{category.postCount} Posts</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
