import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const send = useChatStore((state) => state.sendMessage);
  const density = useUiStore((state) => state.density);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    send(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border/60 bg-background/70 px-4 py-4">
      <div
        data-density={density}
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4",
          density === "compact" && "gap-3 p-3"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[110px] w-full resize-none rounded-xl border border-border/40 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          placeholder="Nachricht senden..."
        />
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={!value.trim()} className="min-w-[120px]">
            Senden
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
