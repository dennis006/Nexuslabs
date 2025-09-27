import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const send = useChatStore((state) => state.sendMessage);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    send(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border/60 bg-background/70 p-3">
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
          placeholder="Nachricht senden..."
        />
        <Button type="submit" size="sm" disabled={!value.trim()}>
          Senden
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
