import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, MessageSquarePlus, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
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
import { useUserStore } from "@/store/userStore";
import { logout } from "@/lib/api/authApi";
import logo from "@/assets/logos/nexuslabs-logo.svg";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleLeft = useUiStore((state) => state.toggleSidebarLeft);
  const toggleRight = useUiStore((state) => state.toggleSidebarRight);
  const density = useUiStore((state) => state.density);
  const toggleDensity = useUiStore((state) => state.toggleDensity);
  const user = useUserStore((state) => state.user);
  const clearSession = useUserStore((state) => state.clear);
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("header.logout.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("header.logout.error"));
    } finally {
      clearSession();
      navigate("/", { replace: true });
    }
  };

  const goToCreate = () => {
    navigate("/create");
  };

  const redirectToLogin = () => {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirectTo=${redirectTo}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8 2xl:max-w-[1720px] 2xl:px-10 3xl:max-w-[1880px]">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-muted-foreground lg:hidden"
          onClick={() => toggleLeft(true)}
          aria-label={t("header.openStats")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="NexusLabs" className="h-9 w-9 rounded-xl" />
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">NexusLabs</span>
        </Link>
        <SearchBar className="hidden flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <Button variant="outline" className="hidden md:flex" onClick={goToCreate}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              {t("header.newThread")}
            </Button>
          ) : (
            <Button variant="outline" className="hidden md:flex" onClick={redirectToLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("header.login")}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                {user?.role === "ADMIN" ? (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {user ? user.displayName ?? user.username : t("header.user.guest")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="capitalize text-muted-foreground" disabled>
                    {t("header.role", { role: user.role.toLowerCase() })}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/u/${user.username}`)}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t("header.user.profile", { defaultValue: "Profil" })}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToCreate}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" /> {t("header.newThread")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleRight(true)}>
                    <Sparkles className="mr-2 h-4 w-4" /> {t("header.trends")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleDensity}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    {density === "comfortable" ? t("header.view.comfortable") : t("header.view.compact")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> {t("header.logout")}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>{t("header.user.welcome")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={redirectToLogin}>
                    <LogIn className="mr-2 h-4 w-4" /> {t("header.login")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/register")}>
                    <UserPlus className="mr-2 h-4 w-4" /> {t("header.account.create")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleRight(true)}>
                    <Sparkles className="mr-2 h-4 w-4" /> {t("header.trends")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleDensity}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    {density === "comfortable" ? t("header.view.comfortable") : t("header.view.compact")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
