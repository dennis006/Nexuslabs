import { MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/uiStore";

const ThemeToggle = () => {
  const theme = useUiStore((state) => state.theme);
  const toggle = useUiStore((state) => state.toggleTheme);
  const title = theme === "dark"
    ? "Light Mode aktivieren"
    : theme === "light"
      ? "Dark Mode aktivieren"
      : "Theme wechseln";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Theme wechseln"
      onClick={() => toggle()}
      className="relative"
      aria-pressed={theme === "light"}
      title={title}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonStar className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;
