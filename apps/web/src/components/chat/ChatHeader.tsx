import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePresenceStore } from "@/store/presenceStore";

interface ChatHeaderProps {
  onMinimize: () => void;
}

const ChatHeader = ({ onMinimize }: ChatHeaderProps) => {
  const online = usePresenceStore((state) => state.onlineCount);
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
      <div>
        <p className="text-sm font-semibold">Community Chat</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> {online} online
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onMinimize}>
        Verbergen
      </Button>
    </div>
  );
};

export default ChatHeader;
