import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ForumSection } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ForumRow } from "./ForumRow";

type SectionProps = {
  section: ForumSection;
  defaultOpen?: boolean;
};

export function Section({ section, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-primary/70" />
          <h2 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground md:text-base">
            {section.title}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChevronDown
            className={cn("h-5 w-5 transition-transform", open ? "rotate-180" : "")}
            aria-hidden="true"
          />
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 }
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/60">
              {section.forums.map((forum) => (
                <ForumRow key={forum.id} data={forum} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
