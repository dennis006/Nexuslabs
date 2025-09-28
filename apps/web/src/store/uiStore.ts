import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";

type Density = "comfortable" | "compact";

type Language = "de" | "en";

type UiStore = {
  theme: Theme;
  sidebarLeftOpen: boolean;
  sidebarRightOpen: boolean;
  activeTab: "new" | "top" | "active" | "unread";
  density: Density;
  language: Language;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveTab: (tab: UiStore["activeTab"]) => void;
  toggleSidebarLeft: (open?: boolean) => void;
  toggleSidebarRight: (open?: boolean) => void;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarLeftOpen: false,
      sidebarRightOpen: false,
      activeTab: "new",
      density: "comfortable",
      language: "de",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set(({ theme }) => {
          if (theme === "light") return { theme: "dark" };
          if (theme === "dark") return { theme: "light" };
          return { theme: "light" };
        }),
      setActiveTab: (activeTab) => set({ activeTab }),
      toggleSidebarLeft: (open) =>
        set(({ sidebarLeftOpen }) => ({ sidebarLeftOpen: open ?? !sidebarLeftOpen })),
      toggleSidebarRight: (open) =>
        set(({ sidebarRightOpen }) => ({ sidebarRightOpen: open ?? !sidebarRightOpen })),
      setDensity: (density) => set({ density }),
      toggleDensity: () =>
        set(({ density }) => ({ density: density === "comfortable" ? "compact" : "comfortable" })),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set(({ language }) => ({ language: language === "de" ? "en" : "de" }))
    }),
    { name: "nexuslabs-ui" }
  )
);
