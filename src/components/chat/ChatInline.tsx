import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { on, startMock, stopMock } from "@/lib/realtime/socketMock";
import { useChatStore } from "@/store/chatStore";
import { Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ChatInline({ className }: { className?: string }) {
  const messages = useChatStore((s) => s.ordered());
  const addMessage = useChatStore((s) => s.addMessage);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startMock();
    const off = on("chat:message", (m) => addMessage(m));
    return () => {
      off();
      stopMock();
    };
  }, [addMessage]);

  useEffect(() => {
    // Auto-scroll ans Ende bei neuer Nachricht
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <Card className={cn("rounded-2xl border bg-card/80 backdrop-blur", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b">
        <div className="text-sm font-semibold">
          Community Chat <span className="ml-2 text-muted-foreground">• live</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Einklappen">
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[280px] md:h-[320px]" viewportRef={ref}>
        <div className="px-4 md:px-5 py-3 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-muted/10 p-3">
              <div className="text-xs text-muted-foreground">
                {m.author?.name ?? "System"} · {new Date(m.createdAt).toLocaleTimeString()}
              </div>
              <div className="text-sm mt-1">{m.text}</div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t px-4 md:px-5 py-3">
        <form
          className="flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const text = String(fd.get("msg") || "").trim();
            if (!text) return;
            useChatStore.getState().addMessage({
              id: crypto.randomUUID(),
              text,
              createdAt: new Date().toISOString(),
              author: { id: "me", name: "You" }
            });
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <textarea
            name="msg"
            placeholder="Nachricht senden…"
            className="min-h-[56px] w-full resize-none rounded-xl border bg-background/70 px-3 py-2 text-sm focus:outline-none"
          />
          <Button type="submit" className="rounded-xl inline-flex gap-2">
            <Send className="h-4 w-4" /> Senden
          </Button>
        </form>
      </div>
    </Card>
  );
}
