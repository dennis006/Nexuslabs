import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ placeholder = "Suche nach Threads, Spielern, Tags", className }: SearchBarProps) => (
  <div className={cn("relative w-full max-w-xl", className)}>
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className="pl-9" placeholder={placeholder} aria-label="Forum durchsuchen" />
  </div>
);

export default SearchBar;
