import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Category } from "@/lib/api/types";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Crosshair,
  Gamepad2,
  HeartPulse,
  Joystick,
  Palette,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Swords,
  Users
} from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import SubcategoryCollapse from "@/components/forum/SubcategoryCollapse";

const iconMap: Record<string, LucideIcon> = {
  crosshair: Crosshair,
  swords: Swords,
  shield: Shield,
  sparkles: Sparkles,
  rocket: Rocket,
  brain: Brain,
  palette: Palette,
  "gamepad-2": Gamepad2,
  smartphone: Smartphone,
  joystick: Joystick,
  users: Users,
  "heart-pulse": HeartPulse
};

const MotionLink = motion(Link);

const CategoryCard = ({ category }: { category: Category }) => {
  const Icon = iconMap[category.icon ?? "sparkles"] ?? Sparkles;
  const density = useUiStore((state) => state.density);

  return (
    <MotionLink
      to={`/forum/${category.id}`}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-density={density}
    >
      <Card className="relative h-full overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-[0_20px_45px_-28px_rgba(0,0,0,0.55)] transition-colors hover:border-primary/50 supports-[backdrop-filter]:bg-card/75">
        <div
          className="flex min-h-[180px] flex-col p-5 md:p-6 2xl:p-7 data-[density=compact]:p-4"
          data-density={density}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight md:text-xl">{category.name}</h3>
          </div>

          {category.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          ) : null}

          {category.subcategories?.length ? <SubcategoryCollapse subs={category.subcategories} /> : null}

          <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground md:text-sm">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {category.threadCount} Threads
            </Badge>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {category.postCount} Posts
            </Badge>
          </div>
        </div>
      </Card>
    </MotionLink>
  );
};

export default CategoryCard;
