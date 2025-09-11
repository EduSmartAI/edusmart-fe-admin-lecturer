// src/components/NotificationProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";

const NotificationContext = createContext<MessageInstance | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <NotificationContext.Provider value={messageApi}>
        {children}
      </NotificationContext.Provider>
    </>
  );
}

// Hook tiện lợi để lấy messageApi
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}
