import type { Metadata } from "next";
import MajorsClient from "./Client";

export const metadata: Metadata = {
  title: "Quản lý Chuyên ngành | EduSmart Admin",
  description: "Tạo và quản lý các chuyên ngành",
};

export default function MajorsPage() {
  return <MajorsClient />;
}
