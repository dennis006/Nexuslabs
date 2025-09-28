import type { ChatMessage } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/time";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  const { t, language } = useTranslation();
  const authorName = message.author?.name ?? t("chat.system");

  return (
    <div className="flex items-start gap-3 rounded-xl bg-background/40 p-3">
      {message.system ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">★</div>
      ) : (
        <Avatar className="h-9 w-9">
          <AvatarImage src={message.author?.avatarUrl} alt={message.author?.name} />
          <AvatarFallback>{authorName.slice(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">{authorName}</span>
          <span className="text-muted-foreground">{formatRelativeTime(message.createdAt, language)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessageItem;
