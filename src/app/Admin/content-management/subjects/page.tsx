import type { Metadata } from "next";
import SubjectsClient from "./Client";

export const metadata: Metadata = {
  title: "Quản lý Môn học | EduSmart Admin",
  description: "Tạo và quản lý các môn học",
};

export default function SubjectsPage() {
  return <SubjectsClient />;
}
