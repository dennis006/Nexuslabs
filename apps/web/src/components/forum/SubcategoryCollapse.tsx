import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { SubCategory } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface SubcategoryCollapseProps {
  subs: SubCategory[];
}

const transition = { duration: 0.28, ease: [0.25, 0.8, 0.25, 1] };

const SubcategoryCollapse = ({ subs }: SubcategoryCollapseProps) => {
  const [open, setOpen] = useState(false);
  const collapseId = useId();
  const visibleSubs = useMemo(() => (open ? subs : subs.slice(0, 6)), [open, subs]);
  const showToggle = subs.length > 6;
  const { t, locale } = useTranslation();

  return (
    <div className="mt-3">
      <div className="relative">
        <motion.div
          layout
          initial={false}
          animate={{ height: !showToggle || open ? "auto" : 96 }}
          transition={transition}
          className={showToggle ? "overflow-hidden" : undefined}
          id={collapseId}
        >
          <div className="flex flex-wrap gap-2">
            {visibleSubs.map((sub) => (
              <span
                key={`sub_${sub.id}`}
                className="rounded-full bg-secondary/60 px-2.5 py-1 text-xs"
                title={t("category.subs.tooltip", { count: sub.threadCount.toLocaleString(locale) })}
              >
                {sub.name}
              </span>
            ))}
          </div>
        </motion.div>
        {showToggle && !open ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card via-card/80 to-transparent" />
        ) : null}
      </div>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-2 text-xs text-primary hover:underline"
          aria-expanded={open}
          aria-controls={collapseId}
        >
          {open
            ? t("category.subs.less")
            : t("category.subs.moreCount", {
                count: (subs.length - 6).toLocaleString(locale)
              })}
        </button>
      ) : null}
    </div>
  );
};

export default SubcategoryCollapse;
