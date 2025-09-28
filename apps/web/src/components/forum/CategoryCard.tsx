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
import { useTranslation } from "@/lib/i18n/TranslationProvider";

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
  const { t, locale } = useTranslation();

  return (
    <MotionLink
      to={`/forum/${category.id}`}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-density={density}
    >
      <Card className="rounded-2xl border bg-card/80 backdrop-blur shadow-sm">
        <div className="flex min-h-[190px] flex-col p-5 md:p-6 2xl:p-7 data-[density=compact]:p-4 md:data-[density=compact]:p-5" data-density={density}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold tracking-tight">{category.name}</h3>
          </div>

          {category.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}

          {!!category.subcategories?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {category.subcategories.slice(0, 6).map((s) => (
                <span key={`sub_${s.id}`} className="rounded-full bg-secondary/60 px-2.5 py-1 text-[11px]">
                  {s.name}
                </span>
              ))}
              {category.subcategories.length > 6 && (
                <button className="text-[11px] text-primary hover:underline">
                  {t("category.more", {
                    count: (category.subcategories.length - 6).toLocaleString(locale)
                  })}
                </button>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {t("category.threadCount", { count: category.threadCount.toLocaleString(locale) })}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
              {t("category.postCount", { count: category.postCount.toLocaleString(locale) })}
            </Badge>
          </div>
        </div>
      </Card>
    </MotionLink>
  );
};

export default CategoryCard;
