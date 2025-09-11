// src/components/Themes/ThemeProvider.tsx
"use client";
import React, { createContext, useContext, useEffect } from "react";
import {
  useModeAnimation,
  ThemeAnimationType,
} from "react-theme-switch-animation";

type ThemeCtx = {
  isDarkMode: boolean;
  ref: React.Ref<HTMLElement>;
  toggleSwitchTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeHook = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
    duration: 600,
    easing: "ease-in-out",
    globalClassName: "dark",
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeHook.isDarkMode) root.classList.add("new-dark");
    else root.classList.remove("new-dark");
  }, [themeHook.isDarkMode]);

  return (
    <ThemeContext.Provider value={themeHook}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
