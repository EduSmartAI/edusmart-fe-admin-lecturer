import React from "react";
import { Spin } from "antd";
import { useLoadingStore } from "EduSmart/stores/Loading/LoadingStore";

const Loading: React.FC = () => {
  const loading = useLoadingStore((state) => state.loading);
  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.5)",
        zIndex: 1000,
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default Loading;
