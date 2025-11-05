import { Metadata } from "next";
import LearningGoalsClient from "./Client";

export const metadata: Metadata = {
  title: "Learning Goals | EduSmart Admin",
  description: "Manage learning goals for courses",
};

export default function LearningGoalsPage() {
  return <LearningGoalsClient />;
}
