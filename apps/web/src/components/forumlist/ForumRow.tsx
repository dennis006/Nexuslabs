import { memo } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ForumNode } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { PostCountBadge } from "./PostCountBadge";
import { LastPostMeta } from "./LastPostMeta";

const iconLibrary = Icons as unknown as Record<string, LucideIcon>;

function resolveIcon(name?: string) {
  if (!name) return null;
  const IconComponent = iconLibrary[name];
  return IconComponent ?? null;
}

type ForumRowProps = {
  data: ForumNode;
};

const ForumRowComponent = ({ data }: ForumRowProps) => {
  const IconComponent = resolveIcon(data.icon);

  return (
    <motion.article
      layout
      whileHover={{ y: -1 }}
      className="group grid grid-cols-[44px_minmax(0,1fr)] items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/10 md:grid-cols-[44px_minmax(0,1fr)_96px_minmax(220px,0.8fr)] md:items-center md:px-5"
    >
      <div className="flex items-center justify-center md:self-stretch">
        {data.emoji ? (
          <span className="text-2xl">{data.emoji}</span>
        ) : IconComponent ? (
          <IconComponent className="h-6 w-6 text-muted-foreground" aria-hidden />
        ) : (
          <Icons.Gamepad2 className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
      </div>

      <div className="space-y-1 md:self-center">
        <h3 className="text-base font-medium tracking-tight md:text-lg">{data.title}</h3>
        {data.description ? (
          <p className="text-xs text-muted-foreground md:text-sm">{data.description}</p>
        ) : null}
        {data.children?.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.children.slice(0, 4).map((child) => (
              <Badge
                key={`sub_${child.id}`}
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-[11px]"
              >
                {child.title}
              </Badge>
            ))}
            {data.children.length > 4 ? (
              <span className="text-[11px] text-muted-foreground">
                +{data.children.length - 4} more
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="hidden md:flex md:items-center md:justify-center">
        <PostCountBadge count={data.posts} />
      </div>

      <div className="hidden md:flex md:justify-end">
        <LastPostMeta data={data.lastPost} />
      </div>

      <div className="col-span-full flex w-full items-start justify-between gap-4 md:hidden">
        <PostCountBadge count={data.posts} className="mx-0" />
        <LastPostMeta data={data.lastPost} align="left" className="flex-1" />
      </div>
    </motion.article>
  );
};

export const ForumRow = memo(ForumRowComponent);
