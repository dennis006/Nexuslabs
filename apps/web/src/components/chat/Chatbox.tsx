import { useEffect, useRef, useState } from "react";
import { Smile, MoreHorizontal, Info, Send } from "lucide-react";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chatStore";
import { mockApi } from "@/lib/api/mockApi";
import type { ChatMessage } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit"
});

const Chatbox = () => {
  const messages = useChatStore((state) => state.ordered());
  const addMessage = useChatStore((state) => state.addMessage);
  const addMessages = useChatStore((state) => state.addMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    void mockApi.getSystemMessages().then((seed) => {
      addMessages(seed);
    });
  }, [addMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const message: ChatMessage = {
      id: nanoid(),
      text: trimmed,
      createdAt: new Date().toISOString(),
      author: {
        id: "you",
        name: "You",
        avatarUrl: "https://i.pravatar.cc/150?img=1"
      }
    };
    addMessage(message);
    setInput("");
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm font-medium md:px-5">
        <span>Community Chat</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Informationen">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Weitere Aktionen">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[260px] md:h-[320px]">
        <div className="space-y-2 py-2">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 px-4 py-3">
              {message.system ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  ★
                </div>
              ) : (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={message.author?.avatarUrl} alt={message.author?.name} />
                  <AvatarFallback>{message.author?.name?.slice(0, 2) ?? "NL"}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{message.author?.name ?? "System"}</span>
                  <span>{timeFormatter.format(new Date(message.createdAt))}</span>
                </div>
                <p className="text-sm text-muted-foreground">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3 md:px-5">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Share a quick update with the squad..."
          className="min-h-[40px] flex-1 resize-none bg-transparent"
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 rounded-full" aria-label="Emoji">
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Senden"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
