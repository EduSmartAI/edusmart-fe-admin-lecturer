"use client";

import { Card, Typography, Avatar, Rate, Space, Tag, Button } from "antd";
import {
  FacebookFilled,
  YoutubeFilled,
  LinkedinFilled,
  TwitterOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

type Props = {
  name?: string;
  role?: string;
  avatar?: string;
  rating?: number;
  students?: number;
  reviews?: number;
  courses?: number;
  bio?: string;
  socials?: Partial<{
    facebook: string;
    youtube: string;
    linkedin: string;
    twitter: string;
  }>;
};

export default function CourseInstructor({
  name = "Trần Minh Khoa",
  role = "Front-end Engineer · 8 năm kinh nghiệm",
  avatar = "https://api.dicebear.com/9.x/adventurer/svg?seed=Khoa&backgroundColor=b6e3f4",
  rating = 4.7,
  students = 12500,
  reviews = 128,
  courses = 6,
  bio = "Mình tập trung vào HTML/CSS, React và UX. Ở khoá này, mình ưu tiên thực hành theo mini-project, giúp bạn build tư duy layout hiện đại.",
  socials = {},
}: Props) {
  return (
    <Card className="rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-800/60">
      <div className="flex items-start gap-4">
        <Avatar src={avatar} size={72} />
        <div className="flex-1">
          <Title level={4} className="!mb-1">
            {name}
          </Title>
          <Text type="secondary">{role}</Text>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <Space size={6}>
              <Rate disabled allowHalf defaultValue={rating} />{" "}
              <Text strong>{rating}</Text>
            </Space>
            <Tag color="green">{students.toLocaleString()} học viên</Tag>
            <Tag color="blue">{reviews} đánh giá</Tag>
            <Tag color="purple">{courses} khóa</Tag>
          </div>
        </div>
      </div>

      <Paragraph className="mt-4 text-gray-700 dark:text-gray-300">
        {bio}
      </Paragraph>

      <Space size={8} wrap className="mt-2">
        {socials.facebook && (
          <Button
            icon={<FacebookFilled />}
            href={socials.facebook}
            target="_blank"
          >
            Facebook
          </Button>
        )}
        {socials.youtube && (
          <Button
            icon={<YoutubeFilled />}
            href={socials.youtube}
            target="_blank"
          >
            YouTube
          </Button>
        )}
        {socials.linkedin && (
          <Button
            icon={<LinkedinFilled />}
            href={socials.linkedin}
            target="_blank"
          >
            LinkedIn
          </Button>
        )}
        {socials.twitter && (
          <Button
            icon={<TwitterOutlined />}
            href={socials.twitter}
            target="_blank"
          >
            Twitter
          </Button>
        )}
      </Space>
    </Card>
  );
}
