"use client";

import { Card, Typography, Tag, Space } from "antd";
import {
  CheckCircleTwoTone,
  AppstoreOutlined,
  TabletOutlined,
  ClockCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

type Props = {
  title?: string;
  summary?: string;
  learnings?: string[];
  requirements?: string[];
  facts?: {
    level?: string;
    duration?: string;
    modules?: number;
    access?: string;
    language?: string;
  };
};

export default function CourseOverview({
  title = "HTML & CSS Foundation",
  summary = "Khóa học nền tảng về HTML5/CSS3, thực hành layout, Flexbox, Grid và responsive. Phù hợp người mới hoặc cần hệ thống lại kiến thức nền.",
  learnings = [
    "Nắm vững cấu trúc HTML5, semantic tags",
    "Style với CSS cơ bản → nâng cao",
    "Flexbox & CSS Grid để dựng layout",
    "Responsive: mobile-first, breakpoints",
    "Quy ước BEM, tổ chức stylesheet",
    "Triển khai mini project cuối khóa",
  ],
  requirements = [
    "Máy tính + trình duyệt",
    "Biết sử dụng VS Code",
    "Không cần kiến thức nền tảng",
  ],
  facts = {
    level: "Beginner",
    duration: "12 giờ video",
    modules: 32,
    access: "Trọn đời",
    language: "Tiếng Việt",
  },
}: Props) {
  const factItems = [
    { icon: <CrownOutlined />, label: "Trình độ", value: facts.level },
    {
      icon: <ClockCircleOutlined />,
      label: "Thời lượng",
      value: facts.duration,
    },
    {
      icon: <AppstoreOutlined />,
      label: "Modules",
      value: String(facts.modules),
    },
    { icon: <TabletOutlined />, label: "Truy cập", value: facts.access },
  ];

  return (
    <Card className="rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
        <div className="flex-1">
          <Title level={4} className="!mb-1">
            {title}
          </Title>
          <Paragraph className="!mb-4 text-gray-700 dark:text-gray-300">
            {summary}
          </Paragraph>
        </div>
        <div className="md:pt-2">
          <Tag color="blue">{facts.language}</Tag>
        </div>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {factItems.map((f, i) => (
          <Card
            key={i}
            size="small"
            className="rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
          >
            <Space align="start" size={12}>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                {f.icon}
              </div>
              <div>
                <Text type="secondary">{f.label}</Text>
                <div className="font-semibold">{f.value}</div>
              </div>
            </Space>
          </Card>
        ))}
      </div>

      {/* 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learnings */}
        <div>
          <Title level={5} className="!mb-3">
            Bạn sẽ học được
          </Title>
          <ul className="space-y-2">
            {learnings.map((it, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <CheckCircleTwoTone twoToneColor="#52c41a" className="mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{it}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <Title level={5} className="!mb-3">
            Yêu cầu đầu vào
          </Title>
          <Space size={[8, 8]} wrap>
            {requirements.map((req, i) => (
              <Tag key={i} color="geekblue">
                {req}
              </Tag>
            ))}
          </Space>

          <div className="mt-5">
            <Text type="secondary">Ngôn ngữ</Text>
            <div>
              <Text strong>{facts.language}</Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
