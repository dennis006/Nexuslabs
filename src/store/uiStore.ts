import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

type UiStore = {
  theme: Theme;
  sidebarLeftOpen: boolean;
  sidebarRightOpen: boolean;
  activeTab: "new" | "top" | "active" | "unread";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveTab: (tab: UiStore["activeTab"]) => void;
  toggleSidebarLeft: (open?: boolean) => void;
  toggleSidebarRight: (open?: boolean) => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      sidebarLeftOpen: false,
      sidebarRightOpen: false,
      activeTab: "new",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setActiveTab: (activeTab) => set({ activeTab }),
      toggleSidebarLeft: (open) =>
        set(({ sidebarLeftOpen }) => ({ sidebarLeftOpen: open ?? !sidebarLeftOpen })),
      toggleSidebarRight: (open) =>
        set(({ sidebarRightOpen }) => ({ sidebarRightOpen: open ?? !sidebarRightOpen }))
    }),
    { name: "nexuslabs-ui" }
  )
);
