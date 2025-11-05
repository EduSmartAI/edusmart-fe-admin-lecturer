import { Metadata } from "next";
import TechnologiesClient from "./Client";

export const metadata: Metadata = {
  title: "Technologies | EduSmart Admin",
  description: "Manage technologies and frameworks",
};

export default function TechnologiesPage() {
  return <TechnologiesClient />;
}
