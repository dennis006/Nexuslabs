import type { ChatMessage } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/time";

const ChatMessageItem = ({ message }: { message: ChatMessage }) => (
  <div className="flex items-start gap-3 rounded-xl bg-background/40 p-3">
    {message.system ? (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
        ★
      </div>
    ) : (
      <Avatar className="h-9 w-9">
        <AvatarImage src={message.author?.avatarUrl} alt={message.author?.name} />
        <AvatarFallback>{message.author?.name?.slice(0, 2) ?? "NL"}</AvatarFallback>
      </Avatar>
    )}
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-foreground">{message.author?.name ?? "System"}</span>
        <span className="text-muted-foreground">{formatRelativeTime(message.createdAt)}</span>
      </div>
      <p className="text-sm text-muted-foreground">{message.text}</p>
    </div>
  </div>
);

export default ChatMessageItem;
