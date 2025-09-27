import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Menu, MessageSquarePlus, Sparkles, UserPlus } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import SearchBar from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/store/uiStore";
import logo from "@/assets/logos/nexuslabs-logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleLeft = useUiStore((state) => state.toggleSidebarLeft);
  const toggleRight = useUiStore((state) => state.toggleSidebarRight);
  const density = useUiStore((state) => state.density);
  const toggleDensity = useUiStore((state) => state.toggleDensity);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8 2xl:max-w-[1720px] 2xl:px-10 3xl:max-w-[1880px]">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground lg:hidden"
          onClick={() => toggleLeft(true)}
          aria-label="Statistik Sidebar öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="NexusLabs" className="h-9 w-9 rounded-xl" />
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">NexusLabs</span>
        </Link>
        <SearchBar className="hidden flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={() => navigate("/create", { state: { from: location.pathname } })}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Neuer Thread
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Sparkles className="mr-2 h-4 w-4" />
                Gast
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Willkommen!</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/login")}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/register")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Account anlegen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggleRight(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Trends anzeigen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleDensity}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Ansicht: {density === "comfortable" ? "Komfort" : "Kompakt"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
