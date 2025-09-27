import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-10 text-center">
    <Ghost className="h-10 w-10 text-muted-foreground" />
    <div>
      <h3 className="text-lg font-semibold">Keine Threads gefunden</h3>
      <p className="text-sm text-muted-foreground">Starte die Diskussion mit einem neuen Beitrag.</p>
    </div>
    <Button asChild>
      <Link to="/create">Thread erstellen</Link>
    </Button>
  </div>
);

export default EmptyState;
