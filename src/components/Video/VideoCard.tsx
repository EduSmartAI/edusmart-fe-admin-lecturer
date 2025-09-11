"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Card } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

// ReactPlayer chỉ load ở client
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

type VideoCardProps = {
  url: string;
  poster?: string;
  title?: string;
  description?: string;
};

export default function VideoCard({
  url,
  poster,
  title = "Video Title",
  description = "Mô tả ngắn về video",
}: VideoCardProps) {
  return (
    <Card
      hoverable
      style={{ width: "100%", maxWidth: 600 }}
      cover={
        <div style={{ position: "relative", paddingTop: "56.25%" /* 16:9 */ }}>
          <ReactPlayer
            src={url}
            controls
            light={!!poster && poster}
            playIcon={
              <PlayCircleOutlined style={{ fontSize: 64, color: "#fff" }} />
            }
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        </div>
      }
    >
      <Card.Meta title={title} description={description} />
    </Card>
  );
}
