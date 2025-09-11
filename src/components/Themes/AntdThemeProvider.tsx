// src/AntdThemeProvider.tsx
"use client";
import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "EduSmart/Provider/ThemeProvider";

export function AntdThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();

  const theme = useMemo(
    () => ({
      cssVar: true,
      algorithm: isDarkMode
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
      token: isDarkMode
        ? {
            colorBgLayout: "#020712",
            colorBgContainer: "#050D18",
            colorText: "#ffffff",
          }
        : {},
    }),
    [isDarkMode],
  );

  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}
