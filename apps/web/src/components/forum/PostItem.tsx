import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post, User } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils/time";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface PostItemProps {
  post: Post;
  author?: User;
  isOp?: boolean;
}

const PostItem = ({ post, author, isOp }: PostItemProps) => {
  const { locale, t } = useTranslation();
  const displayName = author?.name ?? t("thread.unknownUser");

  return (
    <article className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-5 md:p-6">
      <header className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author?.avatarUrl} alt={author?.name} />
          <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            {isOp ? <Badge variant="accent">OP</Badge> : null}
          </div>
          <span className="text-xs text-muted-foreground">{formatDateTime(post.createdAt, locale)}</span>
        </div>
      </header>
      <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default PostItem;
