import type { Metadata } from "next";
import StudentTestDetailClient from "./Client";

export const metadata: Metadata = {
  title: "Student Test Detail | EduSmart Admin",
  description: "View detailed student test submission results",
};

export default function StudentTestDetailPage() {
  return <StudentTestDetailClient />;
}
