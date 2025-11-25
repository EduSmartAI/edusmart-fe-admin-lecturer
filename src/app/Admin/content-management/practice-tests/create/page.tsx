import { Metadata } from "next";
import CreatePracticeTestClient from "./Client";

export const metadata: Metadata = {
  title: "Tạo Bài Thực Hành | EduSmart Admin",
  description: "Tạo bài tập lập trình mới với test cases và code templates",
};

export default function CreatePracticeTestPage() {
  return <CreatePracticeTestClient />;
}
