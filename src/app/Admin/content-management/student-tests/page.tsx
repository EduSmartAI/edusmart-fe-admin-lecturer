import type { Metadata } from "next";
import StudentTestsClient from "./Client";

export const metadata: Metadata = {
  title: "Kết quả bài kiểm tra | EduSmart Admin",
  description: "Quản lý và theo dõi kết quả bài kiểm tra của sinh viên",
};

export default function StudentTestsPage() {
  return <StudentTestsClient />;
}
