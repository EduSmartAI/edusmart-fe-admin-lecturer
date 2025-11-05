import type { Metadata } from "next";
import QuestionsClient from "./Client";

export const metadata: Metadata = {
  title: "Manage Questions | EduSmart Admin",
  description: "Create and manage survey questions",
};

export default function QuestionsPage() {
  return <QuestionsClient />;
}
