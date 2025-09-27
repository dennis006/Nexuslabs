import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<boolean>(() => {
    const v = localStorage.getItem("chatInlineOpen");
    if (v === "1") return true;
    if (v === "0") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  useEffect(() => {
    localStorage.setItem("chatInlineOpen", open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    startMock();
    const off = on("chat:message", addMessage);
    return () => {
      off();
      stopMock();
    };
  }, [addMessage]);

  useEffect(() => {
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [open, messages.length]);

  const panelId = useMemo(() => "chat-panel", []);

  return (
    <Card className={cn("rounded-2xl border bg-card/80 backdrop-blur", className)}>
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
        >
          <span>Community Chat</span>
          <span className="text-muted-foreground">• live</span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Einklappen" : "Ausklappen"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full"
        >
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform",
              open ? "rotate-0" : "-rotate-90"
            )}
          />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="chat-open"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-[280px] md:h-[320px]" viewportRef={viewportRef}>
              <div className="px-4 md:px-5 py-3 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="rounded-xl bg-muted/10 p-3">
                    <div className="text-[11px] md:text-xs text-muted-foreground">
                      {m.author?.name ?? "System"} · {" "}
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="text-sm mt-1">{m.text}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
