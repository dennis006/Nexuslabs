import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Minus, ChevronUp } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatMessageItem from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/store/chatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { on, startMock, stopMock } from "@/lib/realtime/socketMock";
import { mockApi } from "@/lib/api/mockApi";

const ChatDock = () => {
  const [open, setOpen] = useState(true);
  const messages = useChatStore((state) => state.ordered());
  const addMessage = useChatStore((state) => state.addMessage);
  const addMessages = useChatStore((state) => state.addMessages);
  const connect = useChatStore((state) => state.connect);
  const disconnect = useChatStore((state) => state.disconnect);
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
    startMock();
    connect();
    const offMsg = on("chat:message", (m) => addMessage(m));
    return () => {
      offMsg();
      disconnect();
      stopMock();
    };
  }, [addMessage, connect, disconnect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-full max-w-sm flex-col gap-2 sm:right-6">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="chatdock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="glass-panel flex h-[420px] flex-col rounded-2xl border border-border/60 bg-background/90 shadow-xl backdrop-blur"
          >
            <ChatHeader onMinimize={() => setOpen(false)} />
            <ScrollArea className="flex-1">
              <div className="space-y-3 px-4 py-3">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      <ChatMessageItem message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <button
          className="glass-panel flex items-center justify-between rounded-full border border-border/60 px-4 py-2 text-sm shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Chat öffnen"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Live-Chat
          </span>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
      {open && (
        <button
          className="flex items-center justify-center self-end rounded-full border border-border/60 bg-background/90 p-2 text-muted-foreground shadow"
          onClick={() => setOpen(false)}
          aria-label="Chat minimieren"
        >
          <Minus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ChatDock;
