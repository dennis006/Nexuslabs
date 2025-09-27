import type { LastPost } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type LastPostMetaProps = {
  data?: LastPost;
  className?: string;
  align?: "left" | "right";
};

export function LastPostMeta({ data, className, align = "right" }: LastPostMetaProps) {
  const textAlignment = align === "left" ? "text-left" : "text-right";
  const justify = align === "left" ? "justify-start" : "justify-end";

  if (!data) {
    return (
      <div className={cn("text-sm text-muted-foreground/70", textAlignment, className)}>
        No posts yet
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", justify, className)}>
      <img
        src={data.author.avatarUrl ?? "/avatar.png"}
        className="h-8 w-8 rounded-full ring-2 ring-background/70"
        alt={data.author.name}
      />
      <div className={cn("text-sm", textAlignment)}>
        <a className="block text-sm font-medium line-clamp-1 hover:underline" href="#">
          {data.threadTitle}
        </a>
        <p className="text-xs text-muted-foreground">
          By <span className="font-medium">{data.author.name}</span>, {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
