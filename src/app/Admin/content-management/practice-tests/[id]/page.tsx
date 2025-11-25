import { Metadata } from "next";
import PracticeTestDetailClient from "./Client";

export const metadata: Metadata = {
  title: "Chi tiết Practice Test | EduSmart Admin",
  description: "Xem và chỉnh sửa chi tiết bài Practice Test",
};

export default async function PracticeTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PracticeTestDetailClient problemId={id} />;
}
