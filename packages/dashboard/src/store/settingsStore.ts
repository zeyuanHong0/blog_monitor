import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: "blog-monitor-settings" }
  )
);

export default useSettingsStore;
