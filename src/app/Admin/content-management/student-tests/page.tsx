import type { Metadata } from "next";
import StudentTestsClient from "./Client";

export const metadata: Metadata = {
  title: "Student Tests | EduSmart Admin",
  description: "Manage and monitor student test submissions",
};

export default function StudentTestsPage() {
  return <StudentTestsClient />;
}
