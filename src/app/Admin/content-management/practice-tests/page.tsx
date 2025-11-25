import { Metadata } from "next";
import PracticeTestsClient from "./Client";

export const metadata: Metadata = {
  title: "Bài Thực Hành | EduSmart Admin",
  description: "Quản lý bài tập lập trình với test cases và code templates",
};

export default function PracticeTestsPage() {
  return <PracticeTestsClient />;
}
