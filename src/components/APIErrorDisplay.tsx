"use client";

import React from "react";
import { Alert, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface APIErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

export const APIErrorDisplay: React.FC<APIErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const isDetailedError = error.includes("{") || error.includes("status");
  
  return (
    <Alert
      message="API Error"
      description={
        <Space direction="vertical" style={{ width: "100%" }}>
          <code style={{ fontSize: "12px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {error}
          </code>
          <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)" }}>
            {isDetailedError ? "Check browser console (F12) for more details" : ""}
          </span>
        </Space>
      }
      type="error"
      showIcon
      icon={<ExclamationCircleOutlined />}
      closable={!!onDismiss}
      onClose={onDismiss}
      style={{ marginBottom: "16px" }}
    />
  );
};
