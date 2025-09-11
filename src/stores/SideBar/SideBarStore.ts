// src/stores/useSidebarStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (v) => {
        console.log("setCollapsed:", v);
        set({ collapsed: v });
      },
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    {
      name: "sidebar-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrated:", state);
      },
    },
  ),
);
