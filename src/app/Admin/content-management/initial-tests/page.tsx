import { Metadata } from "next";
import InitialTestsClient from "./Client";

export const metadata: Metadata = {
  title: "Bài Kiểm Tra Đầu Vào | EduSmart Admin",
  description: "Quản lý bài kiểm tra đầu vào cho học viên",
};

export default function InitialTestsPage() {
  return <InitialTestsClient />;
}
