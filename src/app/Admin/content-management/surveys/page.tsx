import type { Metadata } from "next";
import SurveysClient from "./Client";

export const metadata: Metadata = {
  title: "Manage Surveys | EduSmart Admin",
  description: "Create and manage course surveys",
};

export default function SurveysPage() {
  return <SurveysClient />;
}
