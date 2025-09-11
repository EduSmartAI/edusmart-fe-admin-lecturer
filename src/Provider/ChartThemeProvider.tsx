// src/components/Themes/ChartThemeProvider.tsx
"use client";
import React from "react";
import { ConfigProvider } from "@ant-design/charts";
import { useTheme } from "./ThemeProvider";

export function ChartThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      common={{
        theme: isDarkMode ? "dark" : "light",
      }}
    >
      {children}
    </ConfigProvider>
  );
}
