import { Metadata } from "next";
import EditPracticeTestClient from "./Client";

export const metadata: Metadata = {
  title: "Chỉnh sửa Practice Test | EduSmart Admin",
  description: "Chỉnh sửa bài Practice Test",
};

export default async function EditPracticeTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPracticeTestClient problemId={id} />;
}
